# EarthLens

EarthLens pairs the existing React/Vite frontend in `frontend/` with a FastAPI and scikit-learn backend in `backend/`. Prediction uploads contain reflectance bands only; the backend estimates soil N, P, and K. Measured nutrient columns are used only in the separate labeled training dataset. The backend does not perform spatial image segmentation.

## Spectral CSV input and band matching

The trained model uses **15 reflectance bands**, at 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 970, 1200, 1450, 1650, and 2200 nm. Each CSV row represents one soil sample. Prediction files need reflectance data, but do not need measured N, P, or K labels.

The frontend sends the selected CSV to the backend. The backend reads it in chunks, selects the required bands from wider spectra, and ignores unrelated columns. Wavelength-labelled headers such as `Reflectance_450nm` and `SPC.450` are supported. If a required wavelength is absent, the backend can interpolate it only when nearby source bands bracket it within 100 nm. This allows different column naming conventions when the wavelength is still encoded in the header; ordinal names such as `Band_1` do not identify a wavelength by themselves. Such files need a wavelength-to-column mapping or accompanying sensor metadata.

Band selection makes compatible CSVs usable; it does not by itself improve model accuracy. Source bands should be calibrated reflectance on a scale consistent with the training data. A different sensor, band response, calibration, or preprocessing may require spectral harmonization and retraining/validation. Header interpretation should use deterministic wavelength metadata and report matched/interpolated bands; an AI header guess alone cannot establish the correct wavelengths or improve prediction accuracy. Predictions on a new dataset should be checked against independent laboratory N/P/K measurements before being treated as validated.

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

This processes a local source file without uploading it through the browser. The browser API accepts the file selected in the frontend and processes it in chunks; its default upload limit is 350 MiB. Both paths use the same wavelength mapping and return predicted N/P/K values for each row.

The reference repository provides useful separation between preprocessing, training, and inference, but its image segmentation and cabbage N₂ models have different tasks/targets and are not reused for soil N/P/K prediction.
