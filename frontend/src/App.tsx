import { useState } from "react";
import Header from "./components/Header";
import SessionCreator from "./components/SessionCreator";
import SessionJoiner from "./components/SessionJoiner";
import SessionDashboard from "./components/SessionDashboard";
import SessionStudentView from "./components/SessionStudentView";
import Analyzing from "./components/Analyzing";
import DiagnosisResult from "./components/DiagnosisResult";

function App() {
  const [vista, setVista] = useState<
    "inicio" | "crear" | "unirse" | "dashboard" | "alumno" | "analizando" | "resultado"
  >("inicio");

  const [codigoSesion, setCodigoSesion] = useState<string>("");
  const [radiografiaURL, setRadiografiaURL] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Crear sesión → Analizando → Resultado
  const handleCrearSesion = (codigo: string, file?: File | null) => {
    if (file) setRadiografiaURL(URL.createObjectURL(file));
    setCodigoSesion(codigo);
    setVista("analizando");

    // Simulación de análisis con IA
    setTimeout(() => {
      setDiagnosis("Posible caries en molares superiores");
      setConfidence(85);
      setVista("resultado");
    }, 3000); // 3 segundos simulando procesamiento
  };

  const handleUnirseSesion = (codigo: string) => {
    setCodigoSesion(codigo);
    setVista("alumno");
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    setVista("analizando");
    setTimeout(() => {
      setDiagnosis("Diagnóstico actualizado tras reintento");
      setConfidence(Math.floor(Math.random() * 40) + 60); // confianza 60-100%
      setVista("resultado");
    }, 3000);
  };

  const handleValidateDiagnosis = () => {
    alert("Diagnóstico validado ✅");
    setVista("dashboard"); // Regresa al Dashboard
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <div className="flex flex-col items-center justify-center mt-10">
        {/* Vista de Inicio */}
        {vista === "inicio" && (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Diagnóstico Asistido por IA</h1>
            <button
              onClick={() => setVista("crear")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Crear sesión
            </button>
            <button
              onClick={() => setVista("unirse")}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
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

        {/* Analizando IA */}
        {vista === "analizando" && <Analyzing />}

        {/* Resultado diagnóstico */}
        {vista === "resultado" && radiografiaURL && (
          <DiagnosisResult
            diagnosis={diagnosis}
            confidence={confidence}
            retryCount={retryCount}
            showCorrectOption={true}
            onValidate={handleValidateDiagnosis}
            onRetry={handleRetry}
            onCorrect={() => alert("Diagnóstico corregido")}
          />
        )}
      </div>
    </div>
  );
}

export default App;
