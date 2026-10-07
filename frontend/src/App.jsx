import React, { useState } from 'react';
import { Navbar, Footer } from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ProcessingPage from './pages/ProcessingPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { API_BASE_URL, getApiError } from './services/api.js';

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
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
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
