import { CheckCircle, RefreshCw, Edit3, GraduationCap } from "lucide-react";

interface DiagnosisResultProps {
  diagnosis: string;
  confidence?: number;
  retryCount?: number;
  onValidate: () => void;
  onRetry: () => void;
  onCorrect: () => void;
  onTeacherMode?: () => void;
  showCorrectOption: boolean;
}

export default function DiagnosisResult({
  diagnosis,
  confidence = 75,
  retryCount = 0,
  onValidate,
  onRetry,
  onCorrect,
  onTeacherMode,
  showCorrectOption,
}: DiagnosisResultProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "from-[#76C7F3] to-[#034C7D]";
    if (confidence >= 60) return "from-[#A0D4F7] to-[#0570B0]";
    return "from-[#E0EAF3] to-[#036B9C]";
  };

  return (
    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-xl mx-4 sm:mx-auto flex flex-col gap-8 border border-[#D0D0D0]">
      
      {/* Nivel de confianza */}
      <div className="p-6 rounded-2xl border border-[#C0C0C0] flex flex-col gap-4">
        <span className="font-semibold text-lg sm:text-xl text-gray-700">
          Nivel de confianza: {confidence}%
        </span>
        <div className="w-full bg-[#E0E0E0] rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full bg-gradient-to-r ${getConfidenceColor(confidence)}`}
            style={{ width: `${confidence}%`, transition: "width 0.5s ease" }}
          />
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Reintentos realizados: <strong>{retryCount}</strong>
        </p>
      </div>

      {/* Diagnóstico */}
      <div className="bg-[#F0F7FB] rounded-2xl p-6 flex flex-col gap-2">
        <h3 className="font-semibold text-[#034C7D] text-lg sm:text-xl">Análisis:</h3>
        <p className="text-[#034C7D] text-base sm:text-lg">{diagnosis}</p>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
        <button
          onClick={onValidate}
          className="flex-1 min-w-[150px] bg-[#76C7F3] hover:bg-[#5AB0E1] text-white font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
        >
          <CheckCircle className="h-6 w-6" />
          Validar
        </button>

        <button
          onClick={onRetry}
          className="flex-1 min-w-[150px] bg-[#F3B76F] hover:bg-[#E1A55A] text-white font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
        >
          <RefreshCw className="h-6 w-6" />
          Rehacer
        </button>

        {showCorrectOption && (
          <button
            onClick={onCorrect}
            className="flex-1 min-w-[150px] bg-[#76A4F3] hover:bg-[#5A89E1] text-white font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
          >
            <Edit3 className="h-6 w-6" />
            Corregir
          </button>
        )}

        {onTeacherMode && (
          <button
            onClick={onTeacherMode}
            className="flex-1 min-w-[150px] bg-[#91D18B] hover:bg-[#75b472] text-white font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
          >
            <GraduationCap className="h-6 w-6" />
            Modo docente
          </button>
        )}
      </div>
    </div>
  );
}
