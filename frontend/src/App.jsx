import React, { useState, useEffect } from 'react';
import { UploadCloud, File, CheckCircle2, Leaf, Droplets, Target, BarChart2, Activity, ChevronRight, Download, RefreshCw, Upload, Network } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---
const mockSpectralData = Array.from({ length: 50 }).map((_, i) => ({
  wavelength: 400 + i * 10,
  reflectance: Math.sin(i * 0.2) * 0.2 + 0.5 + Math.random() * 0.05
}));

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'upload' && <UploadPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'processing' && <ProcessingPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'results' && <ResultsPage setCurrentPage={setCurrentPage} />}
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

function UploadPage({ setCurrentPage }) {
  const [fileSelected, setFileSelected] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileSelected(true);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Soil Analysis</h1>
        <p className="text-muted-foreground text-lg">Upload your hyperspectral dataset to estimate soil nutrient levels.</p>
      </div>

      {!fileSelected ? (
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
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
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
                    <p className="font-medium text-foreground">soil_sample.csv</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">File size</p>
                    <p className="font-medium text-foreground">4.2 MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Samples</p>
                    <p className="font-medium text-foreground">1,240</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Spectral Bands</p>
                    <p className="font-medium text-foreground">215</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-flex">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Ready for analysis
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button 
              onClick={() => setFileSelected(false)}
              className="px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setCurrentPage('processing')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-base font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center"
            >
              Start Analysis <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessingPage({ setCurrentPage }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3000);
    const timer3 = setTimeout(() => setStep(3), 5000);
    const timer4 = setTimeout(() => setStep(4), 7000);
    const timer5 = setTimeout(() => setCurrentPage('results'), 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [setCurrentPage]);

  const steps = [
    "Dataset uploaded",
    "Spectral data processed",
    "Relevant spectral bands identified",
    "Predicting soil nutrients",
    "Generating assessment"
  ];

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background Animated Waveform */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <div className="w-[150%] h-[150%] animate-[spin_60s_linear_infinite] rounded-[40%] bg-primary"></div>
      </div>
      
      <div className="relative z-10 max-w-lg w-full px-6">
        <h1 className="text-3xl font-bold mb-12 text-center">Analyzing Your Soil</h1>
        
        <div className="space-y-6">
          {steps.map((text, idx) => {
            const isCompleted = step > idx;
            const isActive = step === idx;
            const isPending = step < idx;
            
            return (
              <div key={idx} className={`flex items-center transition-all duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mr-4 border-2
                  ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                    isActive ? 'border-primary text-primary bg-background animate-pulse' : 
                    'border-muted-foreground text-muted-foreground bg-transparent'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                   isActive ? <div className="w-2.5 h-2.5 bg-primary rounded-full"></div> : 
                   <div className="w-2 h-2 rounded-full border border-current"></div>}
                </div>
                <span className={`text-lg font-medium ${isActive ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ setCurrentPage }) {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Soil Analysis Results</h1>
          <p className="text-muted-foreground flex items-center text-sm">
            <File className="w-4 h-4 mr-2" /> Dataset: <span className="font-medium text-foreground ml-1 mr-4">soil_sample.csv</span>
            <span className="w-1 h-1 bg-border rounded-full mr-4"></span>
            Analyzed: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex space-x-3">
          <button className="bg-card border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Report
          </button>
          <button 
            onClick={() => setCurrentPage('upload')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> New Sample
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <ResultCard 
          title="Nitrogen" symbol="N" value="48.2" unit="mg/kg" status="Good" 
          statusColor="text-green-700 bg-green-50 border-green-200" progress={65} progressColor="bg-green-500"
        />
        <ResultCard 
          title="Phosphorus" symbol="P" value="21.6" unit="mg/kg" status="Moderate" 
          statusColor="text-amber-700 bg-amber-50 border-amber-200" progress={40} progressColor="bg-amber-500"
        />
        <ResultCard 
          title="Potassium" symbol="K" value="165.4" unit="mg/kg" status="Good" 
          statusColor="text-green-700 bg-green-50 border-green-200" progress={75} progressColor="bg-green-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold flex items-center">
                <BarChart2 className="w-6 h-6 mr-3 text-primary" /> Spectral Analysis
              </h2>
              <p className="text-muted-foreground mt-2">The spectral signature represents how the soil sample reflects different wavelengths of light.</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSpectralData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="wavelength" 
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
                </LineChart>
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
                <span className="font-bold">48.2 mg/kg</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Phosphorus (P)</span>
                <span className="font-bold">21.6 mg/kg</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Potassium (K)</span>
                <span className="font-bold">165.4 mg/kg</span>
              </div>
            </div>
            
            <div className="bg-muted p-5 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Overall Soil Assessment</p>
              <div className="flex items-center text-lg font-bold text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Good Condition
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Nutrient Details</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <DetailCard 
            title="Nitrogen" 
            value="48.2 mg/kg" 
            status="Good"
            statusClass="text-green-700"
            desc="Current levels indicate sufficient nitrogen available for vegetative growth and protein synthesis." 
          />
          <DetailCard 
            title="Phosphorus" 
            value="21.6 mg/kg" 
            status="Moderate"
            statusClass="text-amber-700"
            desc="Levels are slightly below optimal. Consider monitoring for potential impact on root development." 
          />
          <DetailCard 
            title="Potassium" 
            value="165.4 mg/kg" 
            status="Good"
            statusClass="text-green-700"
            desc="Excellent potassium availability, ensuring robust disease resistance and water regulation." 
          />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, symbol, value, unit, status, statusColor, progress, progressColor }) {
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
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
          {status}
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }}></div>
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
