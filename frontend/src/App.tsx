import { useState } from "react";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import SessionCreator from "./components/SessionCreator";
import SessionJoiner from "./components/SessionJoiner";
import SessionDashboard from "./components/SessionDashboard";
import SessionStudentView from "./components/SessionStudentView";
import Analyzing from "./components/Analyzing";
import DiagnosisResult from "./components/DiagnosisResult";

import { showCustomToast } from "./components/CustomToast";
import DienteIcon from "./assets/img/dientelupa.png";

function App() {
  const [vista, setVista] = useState<
    "inicio" | "crear" | "unirse" | "dashboard" | "alumno" | "analizando" | "resultado"
  >("inicio");

  const [codigoSesion, setCodigoSesion] = useState<string>("");
  const [radiografiaURL, setRadiografiaURL] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);

  const handleCrearSesion = (codigo: string, file?: File | null) => {
    if (file) setRadiografiaURL(URL.createObjectURL(file));
    setCodigoSesion(codigo);
    setVista("analizando");

    // Simulación de análisis
    setTimeout(() => {
      setDiagnosis("Posible caries en molares superiores");
      setConfidence(85);
      setVista("resultado");
      showCustomToast("Análisis generado", DienteIcon);
    }, 3000);
  };

  const handleUnirseSesion = (codigo: string) => {
    setCodigoSesion(codigo);
    setVista("alumno");
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    setVista("analizando");

    setTimeout(() => {
      const nuevaConfianza = Math.floor(Math.random() * 40) + 60;
      setDiagnosis("Análisis actualizado tras reintento");
      setConfidence(nuevaConfianza);
      setVista("resultado");
      showCustomToast("Reintento completado", DienteIcon);
    }, 3000);
  };

  const handleValidateDiagnosis = () => {
    showCustomToast("Análisis validado", DienteIcon);
    setVista("dashboard");
  };

  const handleCorrectDiagnosis = () => {
    showCustomToast("Análisis corregido", DienteIcon);
  };

  return (
    <div className="min-h-screen bg-[#E3F2F9] text-gray-800 font-sans">
      <Header logoSize={40} />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#D6E6F2",
            color: "#034C7D",
            border: "1px solid #B0CDE8",
            borderRadius: "16px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          },
        }}
      />

      <div className="flex flex-col items-center justify-center mt-12 px-4 w-full">
        {/* Inicio */}
        {vista === "inicio" && (
          <div className="flex flex-col gap-6 max-w-md w-full p-6 bg-white rounded-3xl shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-center text-[#034C7D]">
              Análisis asistido por IA
            </h1>
            <button
              onClick={() => setVista("crear")}
              className="bg-[#76C7F3] hover:bg-[#5bb0e0] text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Crear sesión
            </button>
            <button
              onClick={() => setVista("unirse")}
              className="bg-[#76C7F3] hover:bg-[#5bb0e0] text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Unirse a sesión
            </button>
          </div>
        )}

        {/* Crear sesión */}
        {vista === "crear" && (
          <SessionCreator
            onSesionCreada={handleCrearSesion}
            onVolver={() => setVista("inicio")}
          />
        )}

        {/* Unirse a sesión */}
        {vista === "unirse" && (
          <SessionJoiner
            onSesionUnida={handleUnirseSesion}
            onVolver={() => setVista("inicio")}
          />
        )}

        {/* Dashboard docente */}
        {vista === "dashboard" && (
          <SessionDashboard codigo={codigoSesion} onVolver={() => setVista("inicio")} />
        )}

        {/* Vista alumno */}
        {vista === "alumno" && radiografiaURL && (
          <SessionStudentView
            codigo={codigoSesion}
            radiografiaURL={radiografiaURL}
            onVolver={() => setVista("inicio")}
          />
        )}

        {/* Analizando IA con animación */}
        {vista === "analizando" && radiografiaURL && (
          <Analyzing imageData={radiografiaURL} />
        )}

        {/* Resultado diagnóstico */}
        {vista === "resultado" && radiografiaURL && (
          <DiagnosisResult
            diagnosis={diagnosis}
            confidence={confidence}
            retryCount={retryCount}
            showCorrectOption={true}
            onValidate={handleValidateDiagnosis}
            onRetry={handleRetry}
            onCorrect={handleCorrectDiagnosis}
          />
        )}
      </div>
    </div>
  );
}

export default App;
