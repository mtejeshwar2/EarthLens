from __future__ import annotations

import numpy as np


class WeightedRegressorEnsemble:
    """Small pickle-friendly weighted average of fitted multi-output regressors."""

    def __init__(self, models: list[object], weights: list[float], names: list[str]):
        if not models or len(models) != len(weights) or len(models) != len(names):
            raise ValueError("Models, weights, and names must be non-empty and have the same length.")
        self.models = models
        self.weights = np.asarray(weights, dtype=float) / np.sum(weights)
        self.names = names

    def predict(self, x):
        values = [np.asarray(model.predict(x), dtype=float) for model in self.models]
        return np.average(np.stack(values, axis=0), axis=0, weights=self.weights)

