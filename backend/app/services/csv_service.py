from __future__ import annotations

import io

import pandas as pd
from fastapi import HTTPException

from app.core.config import MAX_CSV_COLUMNS, MAX_CSV_ROWS, MAX_UPLOAD_BYTES
from app.ml.preprocessing import build_model_matrix, infer_spectral_columns
from app.ml.schema import GROUP_COLUMNS, canonical_target_columns


def read_csv_upload(filename: str | None, content: bytes) -> pd.DataFrame:
    if not filename or not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="Upload a .csv file.")
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB upload limit.")
    try:
        frame = pd.read_csv(io.BytesIO(content), encoding="utf-8-sig", low_memory=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}") from exc
    if frame.empty:
        raise HTTPException(status_code=400, detail="CSV contains no data rows.")
    if frame.columns.duplicated().any():
        duplicates = frame.columns[frame.columns.duplicated()].astype(str).tolist()
        raise HTTPException(status_code=422, detail={"message": "CSV column names must be unique.", "duplicates": duplicates})
    if len(frame) > MAX_CSV_ROWS or len(frame.columns) > MAX_CSV_COLUMNS:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the configured limit ({MAX_CSV_ROWS} rows, {MAX_CSV_COLUMNS} columns).")
    return frame


def inspect_csv(frame: pd.DataFrame) -> dict:
    try:
        feature_names = infer_spectral_columns(frame)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    try:
        matrix = build_model_matrix(frame, feature_names)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    try:
        labels = canonical_target_columns([str(c) for c in frame.columns])
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    group_name = next((c for c in frame.columns if str(c).strip().lower() in GROUP_COLUMNS), None)
    sample_name = next((c for c in frame.columns if str(c).strip().lower() in {"sample_id", "id"}), None)
    return {
        "rows": len(frame), "spectral_bands": len(feature_names), "feature_columns": feature_names,
        "target_columns_present": [target for target in ("N", "P", "K") if target in labels],
        "missing_values": int(matrix.isna().sum().sum()),
        "missing_values_by_band": {str(c): int(matrix[c].isna().sum()) for c in matrix if matrix[c].isna().any()},
        "group_column": group_name, "sample_id_column": sample_name,
        "preview": frame.head(5).where(pd.notna(frame.head(5)), None).to_dict(orient="records"),
    }


def model_matrix_or_422(frame: pd.DataFrame, feature_names: list[str]) -> pd.DataFrame:
    try:
        return build_model_matrix(frame, feature_names)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
