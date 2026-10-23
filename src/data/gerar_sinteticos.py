"""Gerador de dados sintéticos de consumo de água do Crivo.

Simula leituras por hora de um prédio-piloto enquanto o sensor
(ESP32 + YF-S201) não está instalado.
"""
from pathlib import Path

import numpy as np
import pandas as pd

SEMENTE = 42
DIAS = 120
DATA_INICIO = "2026-06-01"
PREDIO_ID = "predio_piloto"
PICO_LITROS_HORA = 900      # consumo na hora mais cheia de um dia útil
N_VAZAMENTOS = 5
SAIDA = Path(__file__).resolve().parents[2] / "data" / "raw" / "leituras_sinteticas.csv"

# Fator de uso por hora do dia (0 = nada, 1 = pico)
PERFIL_HORARIO = np.array([
    0.02, 0.02, 0.02, 0.02, 0.02, 0.05,   # 0h-5h
    0.20, 0.60, 0.95, 1.00, 0.95, 0.85,   # 6h-11h
    0.60, 0.70, 0.95, 1.00, 0.90, 0.70,   # 12h-17h
    0.30, 0.10, 0.05, 0.03, 0.02, 0.02,   # 18h-23h
])


def gerar() -> pd.DataFrame:
    rng = np.random.default_rng(SEMENTE)

    horas = pd.date_range(DATA_INICIO, periods=DIAS * 24, freq="h")
    df = pd.DataFrame({"timestamp": horas})
    df["predio_id"] = PREDIO_ID
    df["hora"] = df["timestamp"].dt.hour
    df["dia_semana"] = df["timestamp"].dt.dayofweek          # 0 = segunda
    df["fim_de_semana"] = (df["dia_semana"] >= 5).astype(int)

    # Temperatura: uma por dia, oscilando ao longo do período
    dias = np.arange(DIAS)
    temp_dia = 29 + 4 * np.sin(2 * np.pi * dias / 30) + rng.normal(0, 1.5, DIAS)
    df["temperatura_c"] = np.repeat(temp_dia, 24).round(1)

    # Consumo base: rotina do prédio x fim de semana x calor
    base = PERFIL_HORARIO[df["hora"].values] * PICO_LITROS_HORA
    base = base * np.where(df["fim_de_semana"] == 1, 0.25, 1.0)
    base = base * (1 + 0.015 * (df["temperatura_c"].values - 25))

    # Variação aleatória de cerca de 10%
    volume = base * rng.normal(1.0, 0.10, len(df))

    # Vazamentos: fluxo constante extra durante 1 a 3 dias
    vazamento = np.zeros(len(df), dtype=int)
    for _ in range(N_VAZAMENTOS):
        inicio = rng.integers(0, len(df) - 72)
        duracao = rng.integers(24, 73)
        extra = rng.uniform(40, 120)                         # litros por hora
        vazamento[inicio:inicio + duracao] = 1
        volume[inicio:inicio + duracao] += extra

    df["volume_litros"] = np.clip(volume, 0, None).round(1)
    df["vazao_l_min"] = (df["volume_litros"] / 60).round(2)
    df["vazamento"] = vazamento
    return df


if __name__ == "__main__":
    dados = gerar()
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    dados.to_csv(SAIDA, index=False)
    print(f"{len(dados)} linhas salvas em {SAIDA}")
    print(f"Horas com vazamento: {dados['vazamento'].sum()}")