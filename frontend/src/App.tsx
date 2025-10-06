import React, { useState, useEffect } from 'react'; // Agregar useEffect
import Header from './components/Header';
import UploadCase from './components/UploadCase';
import Analyzing from './components/Analyzing';
import DiagnosisResult from './components/DiagnosisResult';

type AppState = 'idle' | 'uploading' | 'analyzing' | 'diagnosis' | 'validated' | 'correcting';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<{text: string, confidence: number} | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Función para probar la conexión con el backend
  const testBackendConnection = async () => {
    try {
      console.log("🔍 Probando conexión con backend...");
      
      const testResponse = await fetch('http://localhost:8000/test');
      const testData = await testResponse.json();
      console.log("✅ Test backend:", testData);
      
      const modelResponse = await fetch('http://localhost:8000/model-info');
      const modelData = await modelResponse.json();
      console.log("✅ Model info:", modelData);
      
    } catch (error) {
      console.error("❌ Error conectando con backend:", error);
    }
  };

  // Probar conexión al cargar el componente
  useEffect(() => {
    testBackendConnection();
  }, []);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setAppState('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setAppState('analyzing');
      console.log("📤 Enviando imagen al backend...");
      
      // CORRECCIÓN: Usar localhost en lugar de 127.0.0.1
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        body: formData
      });

      console.log("📥 Respuesta del servidor:", response.status);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);
      
      setCurrentDiagnosis({
        text: data.diagnosis,
        confidence: data.confidence // Ya viene como porcentaje desde el backend
      });
      setAppState('diagnosis');
    } catch (error) {
      console.error('❌ Error al procesar la imagen:', error);
      alert('Ocurrió un error al procesar la imagen. Verifica que el backend esté ejecutándose.');
      setAppState('idle');
      setSelectedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAppState('idle');
    setCurrentDiagnosis(null);
    setRetryCount(0);
  };

  const handleValidate = () => {
    setAppState('validated');
    alert('¡Diagnóstico validado exitosamente! El caso ha sido guardado.');
  };

  const handleRetry = () => {
    if (!selectedFile) return;
    setRetryCount(prev => prev + 1);
    handleFileUpload(selectedFile);
  };

  const handleCorrect = () => {
    setAppState('correcting');
    alert('Función de corrección manual en desarrollo. Aquí el profesor podría editar el diagnóstico.');
    setAppState('diagnosis');
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setCurrentDiagnosis(null);
    setRetryCount(0);
    setAppState('idle');
  };

  const renderContent = () => {
    switch (appState) {
      case 'idle':
      case 'uploading':
        return (
          <UploadCase
            onUpload={handleFileUpload}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
            isUploading={appState === 'uploading'}
          />
        );

      case 'analyzing':
        return <Analyzing />;

      case 'diagnosis':
        return currentDiagnosis ? (
          <DiagnosisResult
            diagnosis={currentDiagnosis.text}
            confidence={currentDiagnosis.confidence}
            onValidate={handleValidate}
            onRetry={handleRetry}
            onCorrect={handleCorrect}
            showCorrectOption={retryCount >= 1}
            retryCount={retryCount}
          />
        ) : null;

      case 'validated':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">¡Caso Validado!</h2>
            <p className="text-gray-600 mb-6">
              El diagnóstico ha sido validado y guardado exitosamente en el sistema.
            </p>
            <button
              onClick={handleStartOver}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Analizar Nuevo Caso
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
}