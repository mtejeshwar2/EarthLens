import { Leaf, Droplets, Target, ChevronRight } from 'lucide-react';

export default function HomePage({ setCurrentPage }) {
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
