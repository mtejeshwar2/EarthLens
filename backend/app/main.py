"""EarthLens CSV hyperspectral N/P/K regression API."""
from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import API_PREFIX, APP_VERSION, MODEL_PATH
from app.schemas.api import HealthResponse, PredictResponse, PreviewResponse
from app.services.chunked_prediction import OUTPUT_JOBS, predict_large_csv, preview_large_csv
from app.services.model_service import model_service

app = FastAPI(
    title="EarthLens Soil Nutrient API", version=APP_VERSION,
    description="CSV hyperspectral regression service for soil nitrogen, phosphorus, and potassium.",
    docs_url="/docs", redoc_url="/redoc",
)
origins = [item.strip() for item in os.getenv("EARTHLENS_CORS_ORIGINS", "http://localhost:5173,http://localhost:8443").split(",") if item.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                   allow_methods=["GET", "POST"], allow_headers=["*"])


def _artifact_or_503():
    try:
        return model_service.get()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/health")
@app.get(f"{API_PREFIX}/health")
def health() -> HealthResponse:
    artifact = _artifact_or_503()
    return HealthResponse(status="ok", service="earthlens-api", version=APP_VERSION,
            model_status="ready" if artifact else "not_trained",
            model_loaded=artifact is not None,
            model_version=artifact.get("version") if artifact else None,
            message=None if artifact else "Train a regression model on paired spectra and measured N/P/K values to enable predictions.")


@app.get(f"{API_PREFIX}/model")
def model_info() -> dict[str, Any]:
    artifact = _artifact_or_503()
    if artifact is None:
        return {"status": "not_trained", "artifact_path": str(MODEL_PATH), "targets": ["N", "P", "K"]}
    return {"status": "ready", "model_name": artifact.get("model_name"),
            "selected_models": artifact.get("selected_models", []),
            "version": artifact.get("version"), "trained_at": artifact.get("trained_at"),
            "feature_count": len(artifact["feature_names"]), "features": artifact["feature_names"],
            "training_rows": artifact.get("training_rows"), "test_metrics": artifact.get("test_metrics")}


def _preview(file: UploadFile) -> dict[str, Any]:
    artifact = _artifact_or_503()
    if artifact is None:
        raise HTTPException(status_code=503, detail="The N/P/K model is not available.")
    return preview_large_csv(file.filename, file.file, artifact)


@app.post("/dataset/preview")
@app.post(f"{API_PREFIX}/dataset/preview")
def preview_dataset(file: UploadFile = File(...)) -> PreviewResponse:
    return PreviewResponse(**_preview(file))


def _predict(file: UploadFile) -> dict[str, Any]:
    artifact = _artifact_or_503()
    if artifact is None:
        raise HTTPException(status_code=503, detail="N/P/K prediction is unavailable until a model has been trained.")
    return predict_large_csv(file.filename, file.file, artifact)


@app.post("/predict")
@app.post(f"{API_PREFIX}/predict")
def predict(file: UploadFile = File(...)) -> PredictResponse:
    return PredictResponse(**_predict(file))


@app.get(f"{API_PREFIX}/predictions/{{job_id}}/download")
def download_predictions(job_id: str):
    output_path = OUTPUT_JOBS.get(job_id)
    if output_path is None or not output_path.is_file():
        raise HTTPException(status_code=404, detail="Prediction output was not found or this API process has restarted.")
    return FileResponse(output_path, media_type="text/csv", filename="earthlens_npk_predictions.csv")
