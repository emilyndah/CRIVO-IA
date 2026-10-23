"""Avalia no conjunto de TESTE e compara o modelo com a baseline."""
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score

from src.models.baseline import prever_baseline
from src.models.treino import ALVO, ARQUIVO_MODELO, PROCESSADOS

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO_METRICAS = RAIZ / "reports" / "metricas.json"


def avaliar() -> dict:
    treino = pd.read_csv(PROCESSADOS / "treino.csv")
    teste = pd.read_csv(PROCESSADOS / "teste.csv")

    pacote = joblib.load(ARQUIVO_MODELO)
    modelo, features = pacote["modelo"], pacote["features"]

    real = teste[ALVO]
    prev_modelo = modelo.predict(teste[features])
    prev_base = prever_baseline(treino, len(teste))

    mae_modelo = mean_absolute_error(real, prev_modelo)
    mae_base = mean_absolute_error(real, prev_base)

    resultado = {
        "erro_medio_por_dia_litros": {
            "estimativa_simples": round(mae_base, 1),
            "previsao_crivo": round(mae_modelo, 1),
        },
        "crivo_erra_menos_percentual": round((mae_base - mae_modelo) / mae_base * 100, 1),
        "dias_testados": len(teste),
        "tecnico": {
            "mae_baseline": round(mae_base, 1),
            "mae_modelo": round(mae_modelo, 1),
            "r2_baseline": round(r2_score(real, prev_base), 3),
            "r2_modelo": round(r2_score(real, prev_modelo), 3),
        },
    }

    ARQUIVO_METRICAS.parent.mkdir(parents=True, exist_ok=True)
    ARQUIVO_METRICAS.write_text(json.dumps(resultado, indent=2), encoding="utf-8")
    return resultado


if __name__ == "__main__":
    r = avaliar()
    print(f"Dias testados: {r['dias_testados']}")
    print(f"Estimativa simples (média) erra: {r['erro_medio_por_dia_litros']['estimativa_simples']} litros por dia")
    print(f"Previsão do Crivo erra: {r['erro_medio_por_dia_litros']['previsao_crivo']} litros por dia")
    print(f"O Crivo erra {r['crivo_erra_menos_percentual']}% menos")