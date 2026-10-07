import { LoaderCircle } from 'lucide-react';

export default function ProcessingPage({ isAnalyzing }) {
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
