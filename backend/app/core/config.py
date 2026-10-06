from __future__ import annotations

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(os.getenv("EARTHLENS_MODEL_PATH", BACKEND_DIR / "models" / "npk_model.joblib"))
MAX_UPLOAD_BYTES = int(os.getenv("EARTHLENS_MAX_UPLOAD_BYTES", str(350 * 1024 * 1024)))
MAX_CSV_ROWS = int(os.getenv("EARTHLENS_MAX_CSV_ROWS", "2000000"))
MAX_CSV_COLUMNS = int(os.getenv("EARTHLENS_MAX_CSV_COLUMNS", "4096"))
PREDICTION_OUTPUT_DIR = Path(os.getenv("EARTHLENS_OUTPUT_DIR", BACKEND_DIR / "outputs"))
PREDICTION_CHUNK_SIZE = int(os.getenv("EARTHLENS_PREDICTION_CHUNK_SIZE", "2048"))
API_PREFIX = "/api/v1"
APP_VERSION = "1.0.0"
