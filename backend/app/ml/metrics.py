from __future__ import annotations

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def regression_metrics(actual, predicted, target_names=("N", "P", "K")) -> dict:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    maes = mean_absolute_error(actual, predicted, multioutput="raw_values")
    rmses = np.sqrt(mean_squared_error(actual, predicted, multioutput="raw_values"))
    r2s = r2_score(actual, predicted, multioutput="raw_values", force_finite=False)
    per_target = {}
    for i, target in enumerate(target_names):
        r2 = float(r2s[i])
        per_target[target] = {"mae": float(maes[i]), "rmse": float(rmses[i]), "r2": r2 if np.isfinite(r2) else None}
    return {"per_target": per_target,
            "mean_mae": float(np.mean(maes)),
            "mean_normalized_mae": float(np.mean(maes / np.maximum(np.ptp(actual, axis=0), 1e-12)))}

