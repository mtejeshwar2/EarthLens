import { Network } from 'lucide-react';

export default function AboutPage() {
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
