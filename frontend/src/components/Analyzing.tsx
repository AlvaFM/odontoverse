import { useState, useEffect } from "react";
import DienteEspejo from "../assets/img/dienteespejo.png";

interface AnalyzingProps {
  imageData: string;
}

export default function Analyzing({ imageData }: AnalyzingProps) {
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeImage() {
      setLoading(true);
      setDiagnosis(null);

      // Simulación de análisis
      const data = await new Promise<{ diagnosis: string }>((resolve) =>
        setTimeout(() => resolve({ diagnosis: "Caries detectada en molares superiores." }), 3000)
      );

      setDiagnosis(data.diagnosis);
      setLoading(false);
    }

    analyzeImage();
  }, [imageData]);

  if (loading) {
    return (
      <div className="bg-[#D6E6F2] rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto border border-[#E0E0E0]">
        {/* Imagen circular con animación de escáner */}
        <div className="relative flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <img
              src={DienteEspejo}
              alt="Analizando radiografía"
              className="rounded-full w-full h-full object-contain z-10 relative"
            />
            {/* Escáner animado */}
            <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden">
              <div className="absolute w-full h-1 bg-scanner-blue opacity-40 animate-scan"></div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Analizando radiografía...
        </h2>
        <p className="text-gray-700 mb-6">
          Nuestra IA está procesando la imagen y generando el diagnóstico.
        </p>

        <div className="w-full bg-[#E0E0E0] rounded-full h-2 mb-4 overflow-hidden">
          <div className="bg-[#5A9BD5] h-2 rounded-full w-3/4 animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-600">Analizando patrones y estructuras dentales...</p>
      </div>
    );
  }

  if (diagnosis) {
    return <div className="max-w-md mx-auto p-4">{/* Aquí irá DiagnosisResult desde App.tsx */}</div>;
  }

  return null;
}
