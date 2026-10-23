"""Prepara os dados: agrega por dia e divide em treino, validação e teste."""
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[2]
ENTRADA = RAIZ / "data" / "raw" / "leituras_sinteticas.csv"
PASTA_SAIDA = RAIZ / "data" / "processed"


def agregar_diario(df: pd.DataFrame) -> pd.DataFrame:
    """Transforma leituras por hora em uma linha por dia."""
    df = df.copy()
    df["data"] = df["timestamp"].dt.date
    diario = df.groupby("data").agg(
        consumo_litros=("volume_litros", "sum"),
        temperatura_c=("temperatura_c", "mean"),
        dia_semana=("dia_semana", "first"),
        fim_de_semana=("fim_de_semana", "first"),
        vazamento=("vazamento", "max"),  # só para conferência, NÃO entra no modelo
    ).reset_index()
    diario = diario.dropna()
    diario = diario[diario["consumo_litros"] >= 0]
    return diario.sort_values("data").reset_index(drop=True)


def dividir_por_data(diario: pd.DataFrame, p_treino=0.70, p_validacao=0.15):
    """Divide mantendo a ordem do tempo: passado treina, futuro testa."""
    n = len(diario)
    fim_treino = int(n * p_treino)
    fim_validacao = int(n * (p_treino + p_validacao))
    treino = diario.iloc[:fim_treino]
    validacao = diario.iloc[fim_treino:fim_validacao]
    teste = diario.iloc[fim_validacao:]
    return treino, validacao, teste


if __name__ == "__main__":
    horario = pd.read_csv(ENTRADA, parse_dates=["timestamp"])
    diario = agregar_diario(horario)
    treino, validacao, teste = dividir_por_data(diario)

    PASTA_SAIDA.mkdir(parents=True, exist_ok=True)
    treino.to_csv(PASTA_SAIDA / "treino.csv", index=False)
    validacao.to_csv(PASTA_SAIDA / "validacao.csv", index=False)
    teste.to_csv(PASTA_SAIDA / "teste.csv", index=False)

    print(f"Dias no total: {len(diario)}")
    print(f"Treino: {len(treino)} | Validação: {len(validacao)} | Teste: {len(teste)}")