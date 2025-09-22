import React, { useState } from 'react';
import Header from './components/Header';
import UploadCase from './components/UploadCase';
import Analyzing from './components/Analyzing';
import DiagnosisResult from './components/DiagnosisResult';

type AppState = 'idle' | 'uploading' | 'analyzing' | 'diagnosis' | 'validated' | 'correcting';

// Simulación de diagnósticos de IA
const generateMockDiagnosis = (attempt: number) => {
  const diagnoses = [
    {
      text: "Se observa una caries dental en el premolar superior derecho (diente 14). La lesión presenta una profundidad moderada que ha penetrado el esmalte y está afectando la dentina. Se recomienda tratamiento con obturación dental y evaluación de posible tratamiento de conducto si hay compromiso pulpar.",
      confidence: 75
    },
    {
      text: "Radiografía muestra periodontitis apical en el molar inferior izquierdo (diente 36). Se evidencia pérdida ósea periapical y ensanchamiento del espacio del ligamento periodontal. El diente requiere tratamiento endodóntico urgente o extracción según evaluación clínica.",
      confidence: 68
    },
    {
      text: "Se identifica fractura radicular en el incisivo central superior (diente 11). La línea de fractura es visible en el tercio medio de la raíz. Se recomienda evaluación inmediata para determinar viabilidad del diente y posible necesidad de extracción e implante.",
      confidence: 82
    }
  ];
  
  return diagnoses[attempt % diagnoses.length];
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<{text: string, confidence: number} | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setAppState('uploading');
    
    // Simular subida de archivo
    setTimeout(() => {
      setAppState('analyzing');
      
      // Simular análisis de IA
      setTimeout(() => {
        const diagnosis = generateMockDiagnosis(retryCount);
        setCurrentDiagnosis(diagnosis);
        setAppState('diagnosis');
      }, 3000);
    }, 1000);
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
    setRetryCount(prev => prev + 1);
    setAppState('analyzing');
    
    setTimeout(() => {
      const diagnosis = generateMockDiagnosis(retryCount + 1);
      setCurrentDiagnosis(diagnosis);
      setAppState('diagnosis');
    }, 3000);
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