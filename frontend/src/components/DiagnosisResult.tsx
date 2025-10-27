// DiagnosisResult.tsx
import { CheckCircle, RefreshCw, Edit3 } from "lucide-react";

interface DiagnosisResultProps {
  diagnosis: string;
  confidence?: number;
  onValidate: () => void;
  onRetry: () => void;
  onCorrect: () => void;
  showCorrectOption: boolean;
}

export default function DiagnosisResult({
  diagnosis,
  confidence = 75,
  onValidate,
  onRetry,
  onCorrect,
  showCorrectOption,
}: DiagnosisResultProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-[#A0D4F7] text-[#07689F]";
    if (confidence >= 60) return "bg-[#C0E0F7] text-[#0570B0]";
    return "bg-[#E0EAF3] text-[#036B9C]";
  };

  return (
    <div className="bg-[#D6E6F2] rounded-2xl shadow-xl p-6 max-w-md mx-auto border border-[#E0E0E0]">
      {/* Confianza */}
      <div className={`p-4 rounded-lg mb-6 border-2 ${getConfidenceColor(confidence)}`}>
        <span className="font-medium">Nivel de confianza: {confidence}%</span>
        <div className="w-full bg-[#E0E0E0] rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full ${getConfidenceColor(confidence)}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="bg-[#E0E0E0] rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-[#034C7D] mb-2">Análisis:</h3>
        <p className="text-[#034C7D]">{diagnosis}</p>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onValidate}
          className="flex-1 min-w-[140px] bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Validar
        </button>

        <button
          onClick={onRetry}
          className="flex-1 min-w-[140px] bg-[#F3B76F] hover:bg-[#E1A55A] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Rehacer
        </button>

        {showCorrectOption && (
          <button
            onClick={onCorrect}
            className="flex-1 min-w-[140px] bg-[#76A4F3] hover:bg-[#5A89E1] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Edit3 className="h-5 w-5" />
            Corregir
          </button>
        )}
      </div>
    </div>
  );
}
