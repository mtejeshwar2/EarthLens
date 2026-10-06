from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

TargetName = Literal["N", "P", "K"]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_status: Literal["ready", "not_trained"]
    model_loaded: bool
    model_version: str | None = None
    message: str | None = None


class PreviewResponse(BaseModel):
    filename: str
    file_size_bytes: int | None = None
    rows: int
    spectral_bands: int
    feature_columns: list[str]
    source_spectral_columns: list[str] = Field(default_factory=list)
    target_columns_present: list[TargetName]
    missing_values: int
    missing_values_by_band: dict[str, int]
    group_column: str | None = None
    sample_id_column: str | None = None
    preview: list[dict[str, Any]]
    model_status: Literal["ready", "not_trained"]
    compatible_with_model: bool | None = None
    missing_model_bands: list[str] = Field(default_factory=list)


class PredictionRow(BaseModel):
    row: int
    sample_id: str
    N: float
    P: float
    K: float


class TargetSummary(BaseModel):
    mean: float
    min: float
    max: float


class ModelMetadata(BaseModel):
    name: str
    selected_models: list[str]
    version: str


class PredictResponse(BaseModel):
    filename: str
    rows: int
    prediction_count: int
    targets: list[TargetName]
    units: dict[TargetName, str]
    summary: dict[TargetName, TargetSummary]
    predictions: list[PredictionRow]
    download_url: str
    model: ModelMetadata
