from __future__ import annotations

import re
from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class BandSource:
    lower: str
    upper: str | None = None
    upper_weight: float = 0.0


_WAVELENGTH_PATTERN = re.compile(
    r"(?:reflectance|spc|spectral|band|wavelength|lambda|wl)[_.\s-]*(\d+(?:\.\d+)?)\s*(?:nm)?$|^(\d+(?:\.\d+)?)\s*nm$",
    re.IGNORECASE,
)


def wavelength_from_column(column: str) -> float | None:
    match = _WAVELENGTH_PATTERN.search(str(column).strip())
    if not match:
        return None
    wavelength = float(match.group(1) or match.group(2))
    return wavelength if 300 <= wavelength <= 2500 else None


def resolve_spectral_mapping(columns: list[str], feature_names: list[str], *, max_gap_nm: float = 100.0) -> dict[str, BandSource]:
    """Map model band centers onto an input's wavelength-labelled spectral columns.

    Exact wavelength matches are preferred. Missing centers may be linearly
    interpolated only when they are bracketed by source bands no more than
    ``max_gap_nm`` apart. Unlabelled ordinal bands are rejected rather than
    guessed.
    """
    column_set = {str(column) for column in columns}
    available: dict[float, list[str]] = {}
    for column in columns:
        wavelength = wavelength_from_column(str(column))
        if wavelength is not None:
            available.setdefault(wavelength, []).append(str(column))

    mapping: dict[str, BandSource] = {}
    missing = []
    wavelengths = sorted(available)
    for feature in feature_names:
        if feature in column_set:
            mapping[feature] = BandSource(lower=feature)
            continue
        target_match = re.search(r"(\d+(?:\.\d+)?)", feature)
        if not target_match:
            missing.append(feature)
            continue
        target = float(target_match.group(1))
        exact = next((w for w in wavelengths if abs(w - target) < 0.5), None)
        if exact is not None:
            mapping[feature] = BandSource(lower=available[exact][0])
            continue
        lower_candidates = [w for w in wavelengths if w < target]
        upper_candidates = [w for w in wavelengths if w > target]
        if not lower_candidates or not upper_candidates:
            missing.append(feature)
            continue
        lower, upper = lower_candidates[-1], upper_candidates[0]
        if upper - lower > max_gap_nm:
            missing.append(feature)
            continue
        upper_weight = (target - lower) / (upper - lower)
        mapping[feature] = BandSource(available[lower][0], available[upper][0], upper_weight)
    if missing:
        raise ValueError(
            "Cannot map the input spectrum to all trained band centers. Missing/interpolation gap too wide for: "
            + ", ".join(missing[:20])
            + ". Use wavelength-labelled columns (for example SPC.450 or Band_450nm) covering the trained range."
        )
    return mapping


def transform_spectral_chunk(frame: pd.DataFrame, mapping: dict[str, BandSource]) -> pd.DataFrame:
    values = {}
    for feature, source in mapping.items():
        lower = pd.to_numeric(frame[source.lower], errors="coerce").to_numpy(dtype=float)
        if source.upper is None:
            values[feature] = lower
            continue
        upper = pd.to_numeric(frame[source.upper], errors="coerce").to_numpy(dtype=float)
        lower_weight = 1.0 - source.upper_weight
        values[feature] = lower * lower_weight + upper * source.upper_weight
    matrix = pd.DataFrame(values, index=frame.index)
    matrix = matrix.replace([np.inf, -np.inf], np.nan)
    if matrix.isna().all(axis=1).any():
        raise ValueError("At least one sample has no usable values in the selected spectral bands.")
    return matrix

