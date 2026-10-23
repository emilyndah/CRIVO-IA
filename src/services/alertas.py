"""Alertas de desperdício de água."""
import joblib
import pandas as pd

from src.data.preprocessamento import ENTRADA, agregar_diario
from src.models.treino import ALVO, ARQUIVO_MODELO, PROCESSADOS

LIMIAR_NOTURNO_L_HORA = 40   # calibrado para os dados simulados
MULTIPLICADOR_SIGMA = 2


def alerta_vazao_noturna(leituras: pd.DataFrame, limiar: float = LIMIAR_NOTURNO_L_HORA) -> pd.DataFrame:
    """De madrugada o consumo deveria ser quase zero. Se não é, pode haver vazamento."""
    df = leituras.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    noite = df[df["timestamp"].dt.hour.between(0, 5)].copy()
    noite["data"] = noite["timestamp"].dt.date

    minimo = noite.groupby("data")["volume_litros"].min().reset_index(name="minimo_noturno_l_h")
    alertas = minimo[minimo["minimo_noturno_l_h"] > limiar].copy()
    alertas["tipo"] = "vazao_noturna"
    alertas["mensagem"] = alertas["minimo_noturno_l_h"].apply(
        lambda v: f"Consumo mínimo de madrugada de {v:.0f} L/h. Possível vazamento."
    )
    return alertas[["data", "tipo", "mensagem"]]


def calcular_sigma() -> float:
    """Erro típico do modelo, medido nos dados de validação."""
    validacao = pd.read_csv(PROCESSADOS / "validacao.csv")
    pacote = joblib.load(ARQUIVO_MODELO)
    previsto = pacote["modelo"].predict(validacao[pacote["features"]])
    return float((validacao[ALVO] - previsto).std())


def alerta_consumo_acima_do_esperado(diario: pd.DataFrame, sigma: float) -> pd.DataFrame:
    """Alerta quando o consumo real passa do previsto + 2 sigmas."""
    pacote = joblib.load(ARQUIVO_MODELO)
    df = diario.copy()
    df["previsto"] = pacote["modelo"].predict(df[pacote["features"]])
    df["limite"] = df["previsto"] + MULTIPLICADOR_SIGMA * sigma

    alertas = df[df[ALVO] > df["limite"]].copy()
    alertas["tipo"] = "consumo_acima_do_esperado"
    alertas["mensagem"] = alertas.apply(
        lambda l: f"Consumo de {l[ALVO]:.0f} L, esperado cerca de {l['previsto']:.0f} L.", axis=1
    )
    return alertas[["data", "tipo", "mensagem"]]


if __name__ == "__main__":
    leituras = pd.read_csv(ENTRADA, parse_dates=["timestamp"])
    diario = agregar_diario(leituras)
    sigma = calcular_sigma()

    noturno = alerta_vazao_noturna(leituras)
    acima = alerta_consumo_acima_do_esperado(diario, sigma)

    dias_vazamento = set(diario.loc[diario["vazamento"] == 1, "data"])
    print(f"Dias com vazamento simulado: {len(dias_vazamento)}")
    for nome, alertas in [("vazão noturna", noturno), ("acima do esperado", acima)]:
        dias_alerta = set(alertas["data"])
        acertos = len(dias_alerta & dias_vazamento)
        print(f"Alerta {nome}: {len(dias_alerta)} dias | acertou {acertos} dos {len(dias_vazamento)} vazamentos")