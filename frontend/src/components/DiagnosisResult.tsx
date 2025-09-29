import React from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Edit3, FileText } from 'lucide-react';

interface DiagnosisResultProps {
  diagnosis: string;
  confidence: number;
  onValidate: () => void;
  onRetry: () => void;
  onCorrect: () => void;
  showCorrectOption: boolean;
  retryCount: number;
}

export default function DiagnosisResult({ 
  diagnosis, 
  confidence, 
  onValidate,  
  onRetry, 
  onCorrect, 
  showCorrectOption,
  retryCount
}: DiagnosisResultProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-50 border-green-200';
    if (confidence >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Resultado del Diagnóstico</h2>
        {retryCount > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Intento #{retryCount + 1}
          </span>
        )}
      </div>

      <div className={`p-4 rounded-lg border-2 mb-6 ${getConfidenceBg(confidence)}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Nivel de Confianza</span>
          <span className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-current h-2 rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Diagnóstico:</h3>
        <p className="text-gray-700 leading-relaxed">{diagnosis}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onValidate}
          className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Validar Diagnóstico
        </button>

        <button
          onClick={onRetry}
          className="flex-1 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Rehacer Diagnóstico
        </button>

        {showCorrectOption && (
          <button
            onClick={onCorrect}
            className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="h-5 w-5" />
            Corregir Diagnóstico
          </button>
        )}
      </div>

      {showCorrectOption && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Múltiples intentos detectados</p>
              <p className="text-sm text-blue-700">
                Si el diagnóstico aún no es correcto, puedes corregirlo manualmente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}