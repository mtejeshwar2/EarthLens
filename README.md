# EarthLens

EarthLens pairs the existing React/Vite frontend in `frontend/` with a FastAPI and scikit-learn backend in `backend/`. Prediction uploads contain reflectance bands only; the backend estimates soil N, P, and K. Measured nutrient columns are used only in the separate labeled training dataset. The backend does not perform spatial image segmentation.

## Run locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`. The versioned endpoints are `/api/v1/health`, `/api/v1/model`, `/api/v1/dataset/preview`, and `/api/v1/predict`. Upload endpoints expect multipart form data with field name `file`. CORS allows the existing Vite ports by default; configure `EARTHLENS_CORS_ORIGINS` for a different frontend host.

In a second terminal, run the connected frontend:

```powershell
cd frontend
npm run dev
```

Open the Vite URL (the project defaults to port `8443`). The Analyze flow validates the CSV through `/dataset/preview`, calls `/predict`, and renders the returned per-row estimates and file-level mean/ranges. Set `VITE_API_BASE_URL` if the backend is hosted somewhere other than `http://localhost:8000/api/v1`.

## Train from a labeled CSV

```powershell
cd backend
python prepare_dataset.py C:\path\to\hyperspectral_soil_nutrient_dataset.csv --output data\soil_spectra_npk.csv
python train_model.py data\soil_spectra_npk.csv
```

Training compares regression families, selects validation performers, creates a weighted ensemble, reports held-out test MAE/RMSE/R² per nutrient, and writes `backend/models/npk_model.joblib` plus a metrics JSON. See [backend/README.md](backend/README.md) for data schema and API response details.

For a large local source CSV, use the chunked runner from `backend/`:

```powershell
python predict_large_csv.py C:\path\to\large_spectra.csv --output outputs\npk_predictions.csv --chunksize 2048
```

This processes a local source file without uploading it through the browser. The browser API also accepts large files and processes them in chunks; its default limit is 350 MiB.

The reference repository provides useful separation between preprocessing, training, and inference, but its image segmentation and cabbage N₂ models have different tasks/targets and are not reused for soil N/P/K prediction.
