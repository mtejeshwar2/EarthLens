from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.ml.schema import METADATA_COLUMNS, TARGET_ALIASES, is_spectral_column


@dataclass
class SpectralDataset:
    features: pd.DataFrame
    targets: pd.DataFrame | None
    groups: pd.Series | None
    sample_ids: list[str]
    feature_names: list[str]
    dropped_rows: int = 0


def infer_spectral_columns(frame: pd.DataFrame, expected: Sequence[str] | None = None) -> list[str]:
    if expected is not None:
        missing = [name for name in expected if name not in frame.columns]
        if missing:
            raise ValueError(f"CSV is missing model feature columns: {missing[:20]}")
        return list(expected)

    explicit = [str(c) for c in frame.columns if is_spectral_column(str(c))]
    if explicit:
        return explicit
    excluded = METADATA_COLUMNS | set(TARGET_ALIASES)
    candidates = []
    for column in frame.columns:
        if str(column).strip().lower() in excluded:
            continue
        numeric = pd.to_numeric(frame[column], errors="coerce")
        if numeric.notna().any():
            candidates.append(str(column))
    if not candidates:
        raise ValueError("No spectral columns found. Name bands Reflectance_<wavelength>nm or Band_1, Band_2, ...")
    return candidates


def build_model_matrix(frame: pd.DataFrame, feature_names: Sequence[str], *, allow_missing: bool = True) -> pd.DataFrame:
    missing = [name for name in feature_names if name not in frame.columns]
    if missing:
        raise ValueError(f"CSV is missing {len(missing)} required trained spectral band(s): {missing[:20]}")
    x = frame[list(feature_names)].apply(pd.to_numeric, errors="coerce").replace([np.inf, -np.inf], np.nan)
    if x.isna().all(axis=1).any():
        raise ValueError("At least one sample has no usable values in the trained spectral bands.")
    if not allow_missing and x.isna().any().any():
        raise ValueError("Spectral data has missing or non-numeric values.")
    return x


def load_training_dataset(frame: pd.DataFrame, *, min_complete_bands: float = 0.7) -> SpectralDataset:
    from app.ml.schema import GROUP_COLUMNS, canonical_target_columns

    targets_by_key = canonical_target_columns([str(c) for c in frame.columns])
    missing_targets = [target for target in ("N", "P", "K") if target not in targets_by_key]
    if missing_targets:
        raise ValueError(f"Training CSV must contain measured targets for all of N, P, K; missing: {missing_targets}.")
    feature_names = infer_spectral_columns(frame)
    x = frame[feature_names].apply(pd.to_numeric, errors="coerce").replace([np.inf, -np.inf], np.nan)
    y = frame[[targets_by_key[target] for target in ("N", "P", "K")]].apply(pd.to_numeric, errors="coerce").replace([np.inf, -np.inf], np.nan)
    y.columns = ["N", "P", "K"]
    min_bands = max(1, int(np.ceil(len(feature_names) * min_complete_bands)))
    keep = y.notna().all(axis=1) & (x.notna().sum(axis=1) >= min_bands)
    groups_column = next((c for c in frame.columns if str(c).strip().lower() in GROUP_COLUMNS), None)
    groups = frame.loc[keep, groups_column].astype(str) if groups_column else None
    sample_column = next((c for c in frame.columns if str(c).strip().lower() in {"sample_id", "id"}), None)
    sample_ids = frame.loc[keep, sample_column].astype(str).tolist() if sample_column else [str(i) for i in range(int(keep.sum()))]
    return SpectralDataset(
        features=x.loc[keep].reset_index(drop=True),
        targets=y.loc[keep].reset_index(drop=True),
        groups=groups.reset_index(drop=True) if groups is not None else None,
        sample_ids=sample_ids,
        feature_names=feature_names,
        dropped_rows=int((~keep).sum()),
    )


def make_preprocessor(scale: bool) -> Pipeline:
    steps = [("imputer", SimpleImputer(strategy="median", keep_empty_features=True))]
    if scale:
        steps.append(("scaler", StandardScaler()))
    return Pipeline(steps)
