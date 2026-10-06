from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split

from app.ml.ensemble import WeightedRegressorEnsemble
from app.ml.metrics import regression_metrics
from app.ml.model_factory import candidate_models
from app.ml.preprocessing import load_training_dataset


def _three_way_split(x, y, groups, seed: int):
    if groups is not None and groups.nunique() >= 3:
        first = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=seed)
        trainval_idx, test_idx = next(first.split(x, y, groups))
        remaining_groups = groups.iloc[trainval_idx]
        second = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=seed + 1)
        train_rel, val_rel = next(second.split(x.iloc[trainval_idx], y.iloc[trainval_idx], remaining_groups))
        train_idx = np.asarray(trainval_idx)[train_rel]
        val_idx = np.asarray(trainval_idx)[val_rel]
        return train_idx, val_idx, test_idx, "field/site-grouped"
    all_idx = np.arange(len(x))
    trainval_idx, test_idx = train_test_split(all_idx, test_size=0.2, random_state=seed)
    train_idx, val_idx = train_test_split(trainval_idx, test_size=0.25, random_state=seed)
    return train_idx, val_idx, test_idx, "random-row (no field/site grouping available)"


def train_and_save(csv_path: Path, output_path: Path, *, seed: int = 42, trees: int = 250) -> dict:
    frame = pd.read_csv(csv_path)
    dataset = load_training_dataset(frame)
    x, y, groups = dataset.features, dataset.targets, dataset.groups
    if len(x) < 30:
        raise ValueError(f"Only {len(x)} valid labeled rows remain; at least 30 are required for train/validation/test splits.")
    train_idx, val_idx, test_idx, split_mode = _three_way_split(x, y, groups, seed)
    x_train, y_train = x.iloc[train_idx], y.iloc[train_idx]
    x_val, y_val = x.iloc[val_idx], y.iloc[val_idx]
    x_test, y_test = x.iloc[test_idx], y.iloc[test_idx]
    n_components = min(8, x.shape[1], max(1, len(train_idx) - 1))
    candidates = candidate_models(seed, trees, n_components)
    leaderboard = []
    fitted = {}
    for name, model in candidates.items():
        if name == "svr_rbf" and len(x_train) > 5000:
            leaderboard.append({"name": name, "skipped": "RBF-SVR has quadratic time/memory cost; skipped above 5,000 training rows."})
            continue
        print(f"Fitting candidate: {name}", flush=True)
        try:
            model.fit(x_train, y_train)
            prediction = model.predict(x_val)
            metrics = regression_metrics(y_val, prediction)
            leaderboard.append({"name": name, "validation": metrics})
            fitted[name] = model
        except Exception as exc:
            leaderboard.append({"name": name, "error": str(exc)})
    eligible = [row for row in leaderboard if "validation" in row]
    if not eligible:
        raise RuntimeError("All candidate regressors failed. Check sample count, numeric spectra, and installed scikit-learn version.")
    eligible.sort(key=lambda row: row["validation"]["mean_normalized_mae"])
    # Keep two distinct model families to balance ensemble diversity and artifact size.
    families = {"ridge": "linear", "pls": "linear", "svr_rbf": "kernel",
                "random_forest": "bagged_trees", "extra_trees": "bagged_trees",
                "hist_gradient_boosting": "boosting"}
    selected_names = []
    used_families = set()
    for row in eligible:
        family = families.get(row["name"], row["name"])
        if family not in used_families:
            selected_names.append(row["name"])
            used_families.add(family)
        if len(selected_names) == 2:
            break
    val_errors = np.array([next(row["validation"]["mean_normalized_mae"] for row in eligible if row["name"] == name) for name in selected_names])
    weights = (1.0 / np.maximum(val_errors, 1e-6)).tolist()

    # Refit selected models on train + validation; keep the held-out test untouched.
    final_x = pd.concat([x_train, x_val], ignore_index=True)
    final_y = pd.concat([y_train, y_val], ignore_index=True)
    final_models = []
    for name in selected_names:
        model = candidate_models(seed, trees, n_components)[name]
        model.fit(final_x, final_y)
        final_models.append(model)
    ensemble = WeightedRegressorEnsemble(final_models, weights, selected_names)
    test_metrics = regression_metrics(y_test, ensemble.predict(x_test))
    artifact = {
        "artifact_format": 1,
        "model": ensemble,
        "feature_names": dataset.feature_names,
        "targets": ["N", "P", "K"],
        "units": {"N": "mg/kg", "P": "mg/kg", "K": "mg/kg"},
        "model_name": "validation-weighted ensemble",
        "selected_models": selected_names,
        "ensemble_weights": [float(w / sum(weights)) for w in weights],
        "version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_rows": len(x),
        "dropped_rows": dataset.dropped_rows,
        "split_mode": split_mode,
        "test_metrics": test_metrics,
        "validation_leaderboard": eligible,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, output_path, compress=3)
    report_path = output_path.with_suffix(".metrics.json")
    report_path.write_text(json.dumps({k: v for k, v in artifact.items() if k != "model"}, indent=2), encoding="utf-8")
    return {"artifact": str(output_path), "metrics_report": str(report_path), "rows": len(x),
            "dropped_rows": dataset.dropped_rows, "features": dataset.feature_names,
            "split_mode": split_mode, "selected_models": selected_names,
            "validation_leaderboard": eligible, "test_metrics": test_metrics}
