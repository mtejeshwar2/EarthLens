from __future__ import annotations

import uuid
from pathlib import Path
from typing import BinaryIO

import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.core.config import MAX_CSV_COLUMNS, MAX_CSV_ROWS, MAX_UPLOAD_BYTES, PREDICTION_CHUNK_SIZE, PREDICTION_OUTPUT_DIR
from app.ml.schema import GROUP_COLUMNS, canonical_target_columns
from app.ml.spectral_mapping import resolve_spectral_mapping, transform_spectral_chunk

OUTPUT_JOBS: dict[str, Path] = {}
ID_COLUMNS = ("SAMPLE_TDR_ID", "Sample_ID", "sample_id", "ID", "id")


def _validate_upload(filename: str | None, source: BinaryIO) -> tuple[list[str], int]:
    if not filename or not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="Upload a .csv file.")
    source.seek(0, 2)
    size = source.tell()
    source.seek(0)
    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty.")
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MiB upload limit.")
    try:
        header = pd.read_csv(source, nrows=0, encoding="utf-8-sig").columns.astype(str).tolist()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV header: {exc}") from exc
    source.seek(0)
    if not header:
        raise HTTPException(status_code=400, detail="CSV has no columns.")
    if len(set(header)) != len(header):
        raise HTTPException(status_code=422, detail="CSV column names must be unique.")
    if len(header) > MAX_CSV_COLUMNS:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_CSV_COLUMNS} column limit.")
    return header, size


def _mapping_or_422(header: list[str], feature_names: list[str]):
    try:
        return resolve_spectral_mapping(header, feature_names)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _selected_columns(mapping, header):
    band_columns = [name for band in mapping.values() for name in (band.lower, band.upper) if name]
    id_column = next((name for name in ID_COLUMNS if name in header), None)
    return list(dict.fromkeys(([id_column] if id_column else []) + band_columns)), id_column


def preview_large_csv(filename: str | None, source: BinaryIO, artifact: dict) -> dict:
    header, size = _validate_upload(filename, source)
    mapping = _mapping_or_422(header, artifact["feature_names"])
    usecols, id_column = _selected_columns(mapping, header)
    feature_sources = list(dict.fromkeys(name for band in mapping.values() for name in (band.lower, band.upper) if name))
    group_column = next((name for name in header if name.strip().lower() in GROUP_COLUMNS), None)
    labels = canonical_target_columns(header) if any(name.strip().lower() in {
        "n", "nitrogen", "available_nitrogen_mgkg", "p", "phosphorus", "available_phosphorus_mgkg",
        "k", "potassium", "available_potassium_mgkg"} for name in header) else {}
    row_count = 0
    missing_count = 0
    missing_by_band = {name: 0 for name in artifact["feature_names"]}
    preview = []
    source.seek(0)
    try:
        chunks = pd.read_csv(source, usecols=usecols, chunksize=PREDICTION_CHUNK_SIZE, encoding="utf-8-sig", low_memory=False)
        for chunk in chunks:
            matrix = transform_spectral_chunk(chunk, mapping)
            missing = matrix.isna()
            missing_count += int(missing.to_numpy().sum())
            for name in matrix.columns:
                missing_by_band[name] += int(missing[name].sum())
            if len(preview) < 5:
                for i in range(min(5 - len(preview), len(chunk))):
                    item = {name: (None if pd.isna(matrix.iloc[i][name]) else float(matrix.iloc[i][name])) for name in matrix}
                    item["sample_id"] = str(chunk.iloc[i][id_column]) if id_column and pd.notna(chunk.iloc[i][id_column]) else str(row_count + i + 1)
                    preview.append(item)
            row_count += len(chunk)
            if row_count > MAX_CSV_ROWS:
                raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_CSV_ROWS:,} row limit.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not validate CSV data: {exc}") from exc
    finally:
        source.seek(0)
    if row_count == 0:
        raise HTTPException(status_code=400, detail="CSV contains no data rows.")
    return {
        "filename": filename, "file_size_bytes": size, "rows": row_count,
        "spectral_bands": len(artifact["feature_names"]), "feature_columns": artifact["feature_names"],
        "source_spectral_columns": feature_sources,
        "target_columns_present": [target for target in ("N", "P", "K") if target in labels],
        "missing_values": missing_count,
        "missing_values_by_band": {name: count for name, count in missing_by_band.items() if count},
        "group_column": group_column, "sample_id_column": id_column, "preview": preview,
        "model_status": "ready", "compatible_with_model": True, "missing_model_bands": [],
    }


def predict_large_csv(filename: str | None, source: BinaryIO, artifact: dict) -> dict:
    header, _ = _validate_upload(filename, source)
    mapping = _mapping_or_422(header, artifact["feature_names"])
    usecols, id_column = _selected_columns(mapping, header)
    PREDICTION_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    job_id = uuid.uuid4().hex
    output_path = PREDICTION_OUTPUT_DIR / f"{job_id}_npk_predictions.csv"
    partial_path = output_path.with_suffix(".partial")
    total = 0
    sums = np.zeros(3, dtype=float)
    minima = np.full(3, np.inf)
    maxima = np.full(3, -np.inf)
    preview_rows = []
    source.seek(0)
    try:
        chunks = pd.read_csv(source, usecols=usecols, chunksize=PREDICTION_CHUNK_SIZE, encoding="utf-8-sig", low_memory=False)
        for chunk in chunks:
            x = transform_spectral_chunk(chunk, mapping)
            prediction = np.asarray(artifact["model"].predict(x), dtype=float)
            if prediction.shape != (len(chunk), 3) or not np.isfinite(prediction).all():
                raise ValueError("Model returned invalid N/P/K predictions.")
            count = len(prediction)
            sums += prediction.sum(axis=0)
            minima = np.minimum(minima, prediction.min(axis=0))
            maxima = np.maximum(maxima, prediction.max(axis=0))
            if len(preview_rows) < 100:
                limit = min(100 - len(preview_rows), count)
                for i in range(limit):
                    sample = str(chunk.iloc[i][id_column]) if id_column and pd.notna(chunk.iloc[i][id_column]) else str(total + i + 1)
                    preview_rows.append({"row": total + i + 1, "sample_id": sample,
                                         "N": float(prediction[i, 0]), "P": float(prediction[i, 1]),
                                         "K": float(prediction[i, 2])})
            if id_column:
                sample_column = chunk[id_column].astype("string")
                fallback_ids = pd.Series([str(total + i + 1) for i in range(count)], index=chunk.index, dtype="string")
                sample_column = sample_column.fillna(fallback_ids)
            else:
                sample_column = [str(total + i + 1) for i in range(count)]
            result = pd.DataFrame({
                "sample_id": sample_column,
                "N_predicted_mgkg": prediction[:, 0], "P_predicted_mgkg": prediction[:, 1],
                "K_predicted_mgkg": prediction[:, 2],
            })
            result.to_csv(partial_path, mode="a", index=False, header=(total == 0))
            total += count
            if total > MAX_CSV_ROWS:
                raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_CSV_ROWS:,} row limit.")
        if total == 0:
            raise HTTPException(status_code=400, detail="CSV contains no data rows.")
        partial_path.replace(output_path)
    except HTTPException:
        partial_path.unlink(missing_ok=True)
        raise
    except Exception as exc:
        partial_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Chunked prediction failed: {exc}") from exc
    finally:
        source.seek(0)

    units = artifact.get("units", {"N": "mg/kg", "P": "mg/kg", "K": "mg/kg"})
    targets = ("N", "P", "K")
    summary = {target: {"mean": float(sums[i] / total), "min": float(minima[i]), "max": float(maxima[i])}
               for i, target in enumerate(targets)}
    OUTPUT_JOBS[job_id] = output_path
    return {"filename": filename, "rows": total, "prediction_count": total,
            "targets": list(targets), "units": units, "summary": summary,
            "predictions": preview_rows,
            "download_url": f"/api/v1/predictions/{job_id}/download",
            "model": {"name": artifact.get("model_name"), "selected_models": artifact.get("selected_models", []),
                      "version": artifact.get("version")}}
