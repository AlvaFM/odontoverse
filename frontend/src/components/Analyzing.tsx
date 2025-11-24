import { useState, useEffect } from "react";
import DienteEspejo from "../assets/img/dienteespejo.png";

interface AnalyzingProps {
  imageData: string;
}

export default function Analyzing({ imageData }: AnalyzingProps) {
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function analyzeImage() {
      setLoading(true);
      setDiagnosis(null);
      setProgress(0);

      // Simulación de barra de progreso
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 100));
      }, 300);

      // Simulación de análisis IA
      const data = await new Promise<{ diagnosis: string }>((resolve) =>
        setTimeout(() => resolve({ diagnosis: "Caries detectada en molares superiores." }), 3000)
      );

      setDiagnosis(data.diagnosis);
      setLoading(false);
      setProgress(100);
      clearInterval(interval);
    }

    analyzeImage();

    return () => clearInterval(interval);
  }, [imageData]);

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md mx-4 sm:mx-auto flex flex-col items-center gap-6 border border-[#D0D0D0]">
        {/* Imagen circular con animación de escáner */}
        <div className="relative w-40 h-40">
          <img
            src={DienteEspejo}
            alt="Analizando radiografía"
            className="rounded-full w-full h-full object-contain z-10 relative"
          />
          <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden">
            <div
              className="absolute w-full h-1 bg-[#5A9BD5] opacity-50 animate-[scan_2s_linear_infinite]"
              style={{ top: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#034C7D] text-center">
          Analizando radiografía...
        </h2>
        <p className="text-gray-600 text-center text-sm sm:text-base max-w-xs">
          Nuestra IA está procesando la imagen y generando el análisis.
        </p>

        <div className="w-full bg-[#E0E0E0] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#76C7F3] to-[#034C7D] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-500 text-sm">
          Analizando patrones y estructuras dentales...
        </p>
      </div>
    );
  }

  if (diagnosis) {
    return (
      <div className="max-w-md mx-auto p-4">
        {/* Aquí el DiagnosisResult se renderizará desde App.tsx */}
      </div>
    );
  }

  return null;
}
