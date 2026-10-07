import { AlertCircle, File, Download, RefreshCw, CheckCircle2, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../services/api.js';

export default function ResultsPage({ result, preview, selectedFile, onNewSample }) {
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
