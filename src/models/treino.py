"""Treina o modelo que prevê o consumo diário esperado (litros por dia)."""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

RAIZ = Path(__file__).resolve().parents[2]
PROCESSADOS = RAIZ / "data" / "processed"
ARQUIVO_MODELO = RAIZ / "models_saved" / "modelo_consumo.joblib"

# 'vazamento' fica de fora de propósito: usá-la seria vazamento de dados
FEATURES = ["fim_de_semana", "temperatura_c"]
ALVO = "consumo_litros"


def treinar():
    treino = pd.read_csv(PROCESSADOS / "treino.csv")
    validacao = pd.read_csv(PROCESSADOS / "validacao.csv")

    modelo = LinearRegression()
    modelo.fit(treino[FEATURES], treino[ALVO])

    previsto = modelo.predict(validacao[FEATURES])
    mae_validacao = mean_absolute_error(validacao[ALVO], previsto)

    ARQUIVO_MODELO.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"modelo": modelo, "features": FEATURES}, ARQUIVO_MODELO)

    print(f"Modelo salvo em {ARQUIVO_MODELO}")
    print(f"MAE na validação: {mae_validacao:.1f} litros/dia")


if __name__ == "__main__":
    treinar()