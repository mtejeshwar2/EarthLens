# EarthLens prediction backend

FastAPI backend for tabular hyperspectral soil analysis. It accepts one soil sample per CSV row and returns model estimates for N, P, and K. Image cubes, patch extraction, CNN segmentation, and spatial sliding windows are intentionally outside this API.

## Structure

```text
backend/
  app/
    core/       runtime settings
    ml/         spectral schema, preprocessing, model factory, metrics, training
    services/   CSV validation and model artifact cache
    main.py     HTTP API
  data/         optional prepared datasets (local)
  models/       generated model and metrics artifacts (local)
  prepare_dataset.py
  train_model.py
```

## CSV format

One sample per row. **Prediction uploads only need reflectance bands**; they do not need N/P/K columns. Accepted wavelength-labelled names include `Reflectance_450nm`, `SPC.450`, `Band_450nm`, and `450nm`. The service maps each input spectrum to the model's trained wavelengths and interpolates a missing wavelength only when nearby source bands bracket it within 100 nm. Training labels are only needed in the separate labeled training dataset. Optional sample IDs are used for display; non-spectral soil properties and target labels are not model features. Keep reflectance calibration and units consistent with the training data.

For the provided `hyperspectral_soil_nutrient_dataset.csv`, preprocessing selects only `Reflectance_*nm` bands, renames measured nutrient columns to N/P/K, retains `Field_Zone` for split isolation, and drops rows missing target values or more than 30% of spectral bands. It ignores derived labels such as `Dominant_Nutrient_Name` and `Soil_Nutrient_Status` to prevent target leakage.

## Install and run (PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for interactive API documentation. The versioned API prefix is `/api/v1`; the root aliases `/health`, `/dataset/preview`, and `/predict` are kept for simple frontend integration. Set `EARTHLENS_CORS_ORIGINS` to a comma-separated allowlist for the frontend deployment. Set `EARTHLENS_MODEL_PATH` to select an artifact path.

## Prepare and train

```powershell
python prepare_dataset.py C:\path\to\hyperspectral_soil_nutrient_dataset.csv --output data\soil_spectra_npk.csv
python train_model.py data\soil_spectra_npk.csv
```

Training compares Ridge, PLS, RBF-SVR, Random Forest, ExtraTrees, and histogram gradient boosting. Candidate selection and ensemble weights use the validation partition. The best two distinct model families are refit on train plus validation data; the test partition remains held out for the final ensemble evaluation. Whole sites/field zones are separated where at least three groups are available. Both the compressed joblib artifact and a JSON evaluation report are saved under `models/`. RBF-SVR is skipped on large training partitions because of its quadratic resource cost.

The CSV schema alone cannot establish measurement provenance or generalization. Treat evaluation scores as evidence about this dataset/split only, and verify performance on independent field sites, sensor sessions, and lab references before interpreting estimates as agronomic recommendations. The supplied reference segmentation/cabbage model is not used: it predicts land-cover classes/N₂ concentration with different labels and cannot predict N/P/K.

## Large CSV prediction

The browser API accepts files up to 350 MiB by default and validates/predicts them in chunks. It writes the complete result to `outputs/` and returns a download URL. To run a local file directly without uploading it through the frontend:

```powershell
cd backend
python predict_large_csv.py C:\path\to\large_spectra.csv --output outputs\npk_predictions.csv --chunksize 2048
```

The runner uses the same wavelength mapping and writes a compact prediction CSV incrementally. Both the API and runner read only the needed spectral bands and optional sample identifier; existing N/P/K label columns are not read as model features.

## API contract

- `GET /api/v1/health` — service and model readiness.
- `GET /api/v1/model` — model version, bands, training row count, and test metrics.
- `POST /api/v1/dataset/preview` — multipart field `file`; scans the uploaded CSV in chunks and returns mapped bands, row count, missing-value summary, and sample preview.
- `POST /api/v1/predict` — multipart field `file`; predicts in chunks, returns the first 100 predictions plus aggregate min/mean/max, and provides a `download_url` for the complete results CSV.
- `GET /api/v1/predictions/{job_id}/download` — downloads the full prediction CSV returned by `/predict`.

Prediction response example:

```json
{
  "filename": "soil.csv",
  "rows": 1,
  "prediction_count": 1,
  "targets": ["N", "P", "K"],
  "units": {"N": "mg/kg", "P": "mg/kg", "K": "mg/kg"},
  "summary": {"N": {"mean": 52.1, "min": 52.1, "max": 52.1}},
  "predictions": [{"row": 1, "sample_id": "S001", "N": 52.1, "P": 18.6, "K": 144.3}],
  "download_url": "/api/v1/predictions/abc123/download",
  "model": {"name": "validation-weighted ensemble", "selected_models": ["extra_trees", "ridge"], "version": "1.0.0"}
}
```

Missing model bands or malformed spectral values return HTTP 422. `/predict` returns HTTP 503 until a trained compatible artifact exists. Upload processing is chunked; complete prediction files are saved under `outputs/` for download.
