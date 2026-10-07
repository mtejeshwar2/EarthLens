import { useState } from 'react';
import { UploadCloud, File, CheckCircle2, ChevronRight, LoaderCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL, getApiError } from '../services/api.js';

export default function UploadPage({ selectedFile, setSelectedFile, datasetPreview, setDatasetPreview, apiError, setApiError, onAnalyze }) {
  const [dragActive, setDragActive] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const loadPreview = async (file) => {
    setApiError('');
    setDatasetPreview(null);
    setSelectedFile(file || null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setApiError('Choose a CSV file to continue.');
      return;
    }
    setIsPreviewing(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`${API_BASE_URL}/dataset/preview`, { method: 'POST', body: form });
      if (!response.ok) throw new Error(await getApiError(response));
      const preview = await response.json();
      setDatasetPreview(preview);
      if (preview.model_status !== 'ready') {
        setApiError('The N/P/K model is not loaded by the backend yet. Train or restore the model artifact, then retry.');
      } else if (preview.compatible_with_model === false) {
        setApiError(`This file is missing ${preview.missing_model_bands?.length || 'some'} spectral band(s) required by the trained model.`);
      }
    } catch (error) {
      setApiError(error.message || 'Could not reach the EarthLens API. Start the backend and try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadPreview(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadPreview(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Soil Analysis</h1>
        <p className="text-muted-foreground text-lg">Upload a CSV with wavelength-labelled spectral bands, such as Reflectance_450nm or SPC.450. Other columns are ignored; the model predicts N, P, and K.</p>
      </div>

      {!selectedFile ? (
        <div 
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all bg-card ${
            dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-muted p-5 rounded-full mb-6">
            <UploadCloud className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Drag & drop your file here</h3>
          <p className="text-muted-foreground mb-8">Supported format: CSV / hyperspectral spectral data</p>
          
          <label className="bg-card border border-border px-6 py-3 rounded-full text-sm font-medium hover:bg-muted transition-colors cursor-pointer shadow-sm">
            Browse Files
            <input type="file" className="hidden" accept=".csv,text/csv" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="bg-muted p-4 rounded-2xl mr-6">
                <File className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-4">Dataset Preview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">File name</p>
                    <p className="font-medium text-foreground break-all">{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">File size</p>
                    <p className="font-medium text-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Samples</p>
                    <p className="font-medium text-foreground">{datasetPreview ? datasetPreview.rows.toLocaleString() : 'Checking…'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Spectral Bands</p>
                    <p className="font-medium text-foreground">{datasetPreview ? datasetPreview.spectral_bands.toLocaleString() : '—'}</p>
                  </div>
                </div>
                <div className={`mt-6 flex items-center text-sm font-medium px-4 py-2 rounded-lg inline-flex ${datasetPreview?.compatible_with_model === false ? 'text-amber-800 bg-amber-50' : 'text-green-700 bg-green-50'}`}>
                  {isPreviewing ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {isPreviewing ? 'Validating CSV with EarthLens API…' : datasetPreview ? `${datasetPreview.spectral_bands} spectral bands detected` : 'Waiting for CSV validation'}
                </div>
                {datasetPreview?.missing_values > 0 && <p className="mt-3 text-sm text-muted-foreground">{datasetPreview.missing_values.toLocaleString()} missing spectral values will be handled by the model pipeline.</p>}
              </div>
            </div>
          </div>

          {apiError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{apiError}</span></div>}
          
          <div className="flex justify-end space-x-4">
            <button 
              onClick={() => loadPreview(null)}
              className="px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onAnalyze}
              disabled={isPreviewing || !datasetPreview?.compatible_with_model}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-base font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPreviewing ? 'Validating…' : 'Start Analysis'} <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
