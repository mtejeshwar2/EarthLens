import React, { useState } from 'react';
import { UploadCloud, File, CheckCircle2, Leaf, Droplets, Target, BarChart2, Activity, ChevronRight, Download, RefreshCw, Network, LoaderCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

async function getApiError(response) {
  try {
    const body = await response.json();
    const detail = body?.detail;
    if (typeof detail === 'string') return detail;
    if (detail?.message) return detail.message;
    return `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetPreview, setDatasetPreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = async () => {
    if (!selectedFile || !datasetPreview?.compatible_with_model) return;
    setApiError('');
    setIsAnalyzing(true);
    setCurrentPage('processing');
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const response = await fetch(`${API_BASE_URL}/predict`, { method: 'POST', body: form });
      if (!response.ok) throw new Error(await getApiError(response));
      setAnalysisResult(await response.json());
      setCurrentPage('results');
    } catch (error) {
      setApiError(error.message || 'Could not reach the EarthLens prediction service.');
      setCurrentPage('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setDatasetPreview(null);
    setAnalysisResult(null);
    setApiError('');
    setCurrentPage('upload');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'upload' && <UploadPage
          selectedFile={selectedFile} setSelectedFile={setSelectedFile}
          datasetPreview={datasetPreview} setDatasetPreview={setDatasetPreview}
          apiError={apiError} setApiError={setApiError} onAnalyze={startAnalysis}
        />}
        {currentPage === 'processing' && <ProcessingPage isAnalyzing={isAnalyzing} />}
        {currentPage === 'results' && <ResultsPage
          result={analysisResult} preview={datasetPreview} selectedFile={selectedFile}
          onNewSample={resetAnalysis}
        />}
        {currentPage === 'about' && <AboutPage />}
      </main>
      
      <Footer />
    </div>
  );
}

function Navbar({ currentPage, setCurrentPage }) {
  const navItemClass = (page) => 
    `cursor-pointer text-sm font-medium transition-colors hover:text-primary ${
      currentPage === page ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
    } pb-1`;

  return (
    <nav className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => setCurrentPage('home')}
        >
          <div className="bg-primary p-2 rounded-lg text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Earth<span className="text-primary">Lense</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <span className={navItemClass('home')} onClick={() => setCurrentPage('home')}>Home</span>
          <span className={navItemClass('upload')} onClick={() => setCurrentPage('upload')}>Analyze</span>
          <span className={navItemClass('about')} onClick={() => setCurrentPage('about')}>About</span>
        </div>
        
        <button 
          onClick={() => setCurrentPage('upload')}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Analyze Soil
        </button>
      </div>
    </nav>
  );
}

function Home({ setCurrentPage }) {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Hyperspectral Soil Analysis
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-tight mb-6">
            Understand Your Soil Through Its <span className="text-primary relative inline-block">
              Spectrum
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Analyze hyperspectral soil data and estimate essential nutrients — Nitrogen, Phosphorus and Potassium.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => setCurrentPage('upload')}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              Analyze Your Soil <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className="bg-card text-foreground border border-border px-8 py-4 rounded-full text-base font-medium hover:bg-muted transition-colors flex items-center justify-center"
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
          <svg className="w-[120%] h-auto text-primary" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,176C960,203,1056,213,1152,192C1248,171,1344,117,1392,90.7L1440,64" />
            <path fill="none" stroke="currentColor" strokeWidth="1" d="M0,160L48,165.3C96,171,192,181,288,160C384,139,480,85,576,80C672,75,768,117,864,144C960,171,1056,181,1152,160C1248,139,1344,85,1392,58.7L1440,32" />
          </svg>
        </div>
      </section>

      {/* Nutrients Section */}
      <section className="bg-card py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Essential Soil Nutrients</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">EarthLense estimates three key macronutrients critical for plant health and agricultural productivity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <NutrientInfoCard 
              icon={<Leaf className="w-6 h-6 text-green-600" />}
              title="Nitrogen"
              symbol="N"
              desc="Supports plant growth and development"
              colorClass="bg-green-100 text-green-800"
            />
            <NutrientInfoCard 
              icon={<Target className="w-6 h-6 text-blue-600" />}
              title="Phosphorus"
              symbol="P"
              desc="Important for root development and energy transfer"
              colorClass="bg-blue-100 text-blue-800"
            />
            <NutrientInfoCard 
              icon={<Droplets className="w-6 h-6 text-purple-600" />}
              title="Potassium"
              symbol="K"
              desc="Supports overall plant strength and regulation"
              colorClass="bg-purple-100 text-purple-800"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A seamless workflow from data upload to comprehensive soil assessment.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard number="1" title="Upload hyperspectral data" />
            <StepCard number="2" title="Process spectral information" />
            <StepCard number="3" title="Estimate N, P and K" />
            <StepCard number="4" title="View soil assessment" />
          </div>
        </div>
      </section>
    </div>
  );
}

function NutrientInfoCard({ icon, title, symbol, desc, colorClass }) {
  return (
    <div className="bg-background border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-muted rounded-xl">
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-md text-sm font-bold ${colorClass}`}>
          {symbol}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title }) {
  return (
    <div className="relative pt-6">
      <div className="absolute -top-3 left-6 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-background">
        {number}
      </div>
      <div className="bg-card border border-border p-6 pt-10 rounded-2xl h-full shadow-sm hover:border-primary/30 transition-colors">
        <h4 className="font-semibold text-foreground text-lg">{title}</h4>
      </div>
    </div>
  );
}

function UploadPage({ selectedFile, setSelectedFile, datasetPreview, setDatasetPreview, apiError, setApiError, onAnalyze }) {
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

function ProcessingPage({ isAnalyzing }) {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background Animated Waveform */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <div className="w-[150%] h-[150%] animate-[spin_60s_linear_infinite] rounded-[40%] bg-primary"></div>
      </div>
      
      <div className="relative z-10 max-w-lg w-full px-6">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-6 h-12 w-12 animate-spin text-primary" />
          <h1 className="text-3xl font-bold mb-3">Analyzing Your Soil</h1>
          <p className="text-muted-foreground">{isAnalyzing ? 'The EarthLens model is generating N, P, and K estimates for each CSV row.' : 'Preparing your dataset…'}</p>
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ result, preview, selectedFile, onNewSample }) {
  if (!result) {
    return <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center"><AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-600" /><h1 className="text-2xl font-bold">No prediction available</h1><p className="mt-2 text-muted-foreground">Upload a CSV and run an analysis to see its N, P, and K estimates.</p><button onClick={onNewSample} className="mt-6 rounded-full bg-primary px-6 py-3 text-primary-foreground">Upload CSV</button></div>;
  }
  const predictions = result.predictions || [];
  const sampleCount = result.prediction_count ?? result.rows ?? predictions.length;
  const units = result.units || { N: 'mg/kg', P: 'mg/kg', K: 'mg/kg' };
  const summary = result.summary || {};
  const average = (target) => Number(summary[target]?.mean ?? 0);
  const format = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const nutrientCards = [
    { key: 'N', title: 'Nitrogen (N)', description: 'Model prediction from hyperspectral reflectance data.' },
    { key: 'P', title: 'Phosphorus (P)', description: 'Model prediction from hyperspectral reflectance data.' },
    { key: 'K', title: 'Potassium (K)', description: 'Model prediction from hyperspectral reflectance data.' },
  ];
  const firstSpectrum = preview?.preview?.[0] || {};
  const spectralData = (preview?.feature_columns || []).map((column) => {
    const wavelength = column.match(/\d+(?:\.\d+)?/);
    const value = firstSpectrum[column];
    return { band: wavelength ? wavelength[0] : column, reflectance: value == null || value === '' ? NaN : Number(value) };
  }).filter((point) => Number.isFinite(point.reflectance));
  const downloadReport = () => {
    if (result.download_url) {
      const link = document.createElement('a');
      link.href = new URL(result.download_url, API_BASE_URL).toString();
      link.download = `${(selectedFile?.name || 'earthlens_predictions').replace(/\.csv$/i, '')}_npk_predictions.csv`;
      link.click();
      return;
    }
    const header = ['sample_id', 'nitrogen_N', 'phosphorus_P', 'potassium_K'];
    const rows = predictions.map((row) => [row.sample_id, row.N, row.P, row.K].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(selectedFile?.name || 'earthlens_predictions').replace(/\.csv$/i, '')}_npk_predictions.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Soil Analysis Results</h1>
          <p className="text-muted-foreground flex items-center text-sm">
            <File className="w-4 h-4 mr-2" /> Dataset: <span className="font-medium text-foreground ml-1 mr-4">{selectedFile?.name || result.filename}</span>
            <span className="w-1 h-1 bg-border rounded-full mr-4"></span>
            Analyzed: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex space-x-3">
          <button onClick={downloadReport} disabled={!predictions.length} className="bg-card border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center shadow-sm disabled:opacity-50">
            <Download className="w-4 h-4 mr-2" /> Report
          </button>
          <button 
            onClick={onNewSample}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> New Sample
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {nutrientCards.map(({ key, title }) => <ResultCard key={key} title={title} symbol={key}
          value={format(average(key))} unit={units[key] || 'mg/kg'} />)}
      </div>
      <p className="mt-4 mb-12 text-sm text-muted-foreground">
        <strong>Note:</strong> Predictions are estimated from hyperspectral reflectance data using the trained N-P-K model. Accuracy for this sample cannot be determined without laboratory-measured N, P, and K values.
      </p>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold flex items-center">
                <BarChart2 className="w-6 h-6 mr-3 text-primary" /> Spectral Analysis
              </h2>
              <p className="text-muted-foreground mt-2">Reflectance values from the first sample in your uploaded CSV.</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {spectralData.length ? <LineChart data={spectralData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="band" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reflectance" 
                    stroke="var(--primary)" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
                  />
                </LineChart> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No reflectance values available to chart.</div>}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex-1">
            <h2 className="text-xl font-bold mb-6">Analysis Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Nitrogen (N)</span>
                <span className="font-bold">{format(average('N'))} {units.N || 'mg/kg'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Phosphorus (P)</span>
                <span className="font-bold">{format(average('P'))} {units.P || 'mg/kg'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Potassium (K)</span>
                <span className="font-bold">{format(average('K'))} {units.K || 'mg/kg'}</span>
              </div>
            </div>
            
            <div className="bg-muted p-5 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Prediction status</p>
              <div className="flex items-center text-lg font-bold text-primary">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Estimates generated for {sampleCount.toLocaleString()} sample{sampleCount === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Nutrient Details</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <DetailCard 
            title="Nitrogen (N)" 
            value={`${format(average('N'))} ${units.N || 'mg/kg'}`}
            status="Model prediction"
            statusClass="text-muted-foreground"
            desc={nutrientCards[0].description}
          />
          <DetailCard 
            title="Phosphorus (P)" 
            value={`${format(average('P'))} ${units.P || 'mg/kg'}`}
            status="Model prediction"
            statusClass="text-muted-foreground"
            desc={nutrientCards[1].description}
          />
          <DetailCard 
            title="Potassium (K)" 
            value={`${format(average('K'))} ${units.K || 'mg/kg'}`}
            status="Model prediction"
            statusClass="text-muted-foreground"
            desc={nutrientCards[2].description}
          />
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-2xl font-bold">Sample predictions</h2><p className="text-sm text-muted-foreground">Per-row model estimates returned by the backend.</p></div>
          <span className="text-sm text-muted-foreground">Showing {predictions.length.toLocaleString()} of {sampleCount.toLocaleString()}</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Sample</th><th className="px-5 py-3 font-semibold">N ({units.N || 'mg/kg'})</th><th className="px-5 py-3 font-semibold">P ({units.P || 'mg/kg'})</th><th className="px-5 py-3 font-semibold">K ({units.K || 'mg/kg'})</th></tr></thead>
            <tbody>{predictions.slice(0, 100).map((row) => <tr key={`${row.row}-${row.sample_id}`} className="border-t border-border"><td className="px-5 py-3 font-medium">{row.sample_id}</td><td className="px-5 py-3">{format(row.N)}</td><td className="px-5 py-3">{format(row.P)}</td><td className="px-5 py-3">{format(row.K)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, symbol, value, unit }) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-4xl font-bold text-foreground tracking-tight">{value}</h3>
            <span className="text-sm font-medium text-muted-foreground ml-2">{unit}</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold text-primary">
          Model prediction
        </div>
      </div>
      
      <div className="absolute -right-6 -bottom-6 text-[120px] font-black text-muted opacity-20 pointer-events-none select-none">
        {symbol}
      </div>
    </div>
  );
}

function DetailCard({ title, value, status, statusClass, desc }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-lg">{title}</h4>
        <span className={`font-semibold text-sm ${statusClass}`}>{status}</span>
      </div>
      <p className="text-2xl font-bold mb-4">{value}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About EarthLense</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Advancing soil analysis through hyperspectral imaging and machine learning.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Network className="w-6 h-6 mr-3 text-primary" /> The Technology
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            EarthLense utilizes hyperspectral data combined with machine-learning-based regression models to estimate crucial soil nutrient properties. By analyzing how soil reflects light across hundreds of narrow spectral bands, we can determine the chemical composition without destructive laboratory testing.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border">
          <div className="bg-background border border-border p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Hyperspectral Imaging</h3>
            <p className="text-sm text-muted-foreground">Captures a continuous spectrum of light for each spatial pixel, providing a detailed "fingerprint" of the soil sample.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Spectral Analysis</h3>
            <p className="text-sm text-muted-foreground">Extracts relevant features and identifies specific absorption bands correlated with chemical properties.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Machine Learning</h3>
            <p className="text-sm text-muted-foreground">Applies robust regression models trained on extensive datasets to translate spectral signatures into actionable measurements.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Nutrient Estimation</h3>
            <p className="text-sm text-muted-foreground">Delivers rapid, non-destructive estimates for Nitrogen, Phosphorus, and Potassium levels directly from the spectral data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">EarthLense</span>
        </div>
        <p>© {new Date().getFullYear()} EarthLense. Hyperspectral Soil Analysis.</p>
      </div>
    </footer>
  );
}
