"""Converte litros em reais."""
import pandas as pd

# ATENÇÃO: valor de exemplo. Substituir pela tarifa real da concessionária.
TARIFA_RS_M3 = 10.00


def litros_para_reais(litros: float, tarifa: float = TARIFA_RS_M3) -> float:
    return round(litros / 1000 * tarifa, 2)


def adicionar_custo(consumo: pd.DataFrame, tarifa: float = TARIFA_RS_M3) -> pd.DataFrame:
    consumo = consumo.copy()
    consumo["custo_reais"] = (consumo["litros"] / 1000 * tarifa).round(2)
    return consumo