"""Consumo agregado por dia, semana ou mês."""
import pandas as pd

REGRAS = {"dia": "D", "semana": "W-MON", "mes": "MS"}


def consumo_por_periodo(leituras: pd.DataFrame, periodo: str) -> pd.DataFrame:
    if periodo not in REGRAS:
        raise ValueError(f"Período inválido: {periodo}. Use dia, semana ou mes.")

    df = leituras.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    agrupado = df.resample(REGRAS[periodo], on="timestamp", closed="left", label="left").agg(
        litros=("volume_litros", "sum"),
        vazao_media_l_min=("vazao_l_min", "mean"),
        vazao_pico_l_min=("vazao_l_min", "max"),
    )
    agrupado = agrupado.round(2).reset_index().rename(columns={"timestamp": "periodo"})
    return agrupado


def vazao_atual(leituras: pd.DataFrame) -> dict:
    """Última leitura registrada."""
    ultima = leituras.sort_values("timestamp").iloc[-1]
    return {
        "timestamp": str(ultima["timestamp"]),
        "volume_litros": float(ultima["volume_litros"]),
        "vazao_l_min": float(ultima["vazao_l_min"]),
    }