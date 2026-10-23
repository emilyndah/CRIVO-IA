"""Baseline: sempre prever a média histórica do treino."""
import numpy as np
import pandas as pd


def prever_baseline(treino: pd.DataFrame, quantidade: int) -> np.ndarray:
    media = treino["consumo_litros"].mean()
    return np.full(quantidade, media)