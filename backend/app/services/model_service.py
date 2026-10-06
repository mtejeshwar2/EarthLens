from __future__ import annotations

import threading
from pathlib import Path

import joblib

from app.core.config import MODEL_PATH


class ModelService:
    def __init__(self, path: Path = MODEL_PATH):
        self.path = path
        self._artifact = None
        self._mtime_ns = None
        self._lock = threading.Lock()

    def get(self):
        if not self.path.is_file():
            return None
        modified = self.path.stat().st_mtime_ns
        if self._artifact is not None and modified == self._mtime_ns:
            return self._artifact
        with self._lock:
            modified = self.path.stat().st_mtime_ns
            if self._artifact is None or modified != self._mtime_ns:
                try:
                    artifact = joblib.load(self.path)
                except Exception as exc:
                    raise RuntimeError(f"Could not load model artifact at {self.path}: {exc}") from exc
                required = {"model", "feature_names", "targets", "units", "version"}
                if not required.issubset(artifact):
                    raise RuntimeError("Model artifact is missing required metadata. Retrain using backend/train_model.py.")
                if artifact["targets"] != ["N", "P", "K"]:
                    raise RuntimeError("Model artifact target schema must be [N, P, K].")
                self._artifact = artifact
                self._mtime_ns = modified
        return self._artifact


model_service = ModelService()

