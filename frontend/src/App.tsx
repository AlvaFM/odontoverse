import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

import Header from "./components/Header";
import SessionCreator from "./components/SessionCreator";
import SessionJoiner from "./components/SessionJoiner";
import SessionDashboard from "./components/SessionDashboard";
import SessionStudentView from "./components/SessionStudentView";
import Analyzing from "./components/Analyzing";
import DiagnosisResult from "./components/DiagnosisResult";
import ClinicalAssistant from "./components/ClinicalAssistant";
import TeacherMode from "./components/TeacherMode";
import Leaderboard from "./components/Leaderboard";
import TutorialDental from "./components/TutorialDental"; 



import { showCustomToast } from "./components/CustomToast";

// SVGs de las cards y teacher
import CameraIcon from "./assets/img/camera.svg";
import GroupIcon from "./assets/img/group.svg";
import LearnIcon from "./assets/img/learn.svg";
import IaIcon from "./assets/img/ia.svg";
import DienteIcon from "./assets/img/dientelupa.png";

function App() {
  const [vista, setVista] = useState<
    | "inicio"
    | "crear"
    | "unirse"
    | "dashboard"
    | "alumno"
    | "analizando"
    | "resultado"
    | "teacher"
    | "leaderboard"
  >("inicio");

  const [codigoSesion, setCodigoSesion] = useState<string>("");
  const [radiografiaURL, setRadiografiaURL] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  

  // Funciones de sesión
  const handleCrearSesion = async (codigo: string, file?: File | null) => {
    if (!file) {
      showCustomToast("Debes subir una radiografía", DienteIcon);
      return;
    }
    
    setRadiografiaURL(URL.createObjectURL(file));
    setCodigoSesion(codigo);
    setVista("analizando");

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('file', file);

      // Enviar la imagen al backend
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Actualizar el estado con los resultados de la predicción
      setDiagnosis(result.diagnosis);
      setConfidence(result.confidence);
      setVista("resultado");
      showCustomToast("Análisis generado", DienteIcon);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      showCustomToast("Error al procesar la imagen", DienteIcon);
      setDiagnosis("Error al analizar la imagen");
      setConfidence(0);
      setVista("resultado");
    }
  };

  const handleUnirseSesion = (codigo: string) => {
    if (!codigo) {
      showCustomToast("Debe ingresar un código válido", DienteIcon);
      return;
    }
    setCodigoSesion(codigo.toUpperCase());
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

  
  const handleGoToTeacherMode = () => setVista("teacher");
  const handleGoToLeaderboard = () => setVista("leaderboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4FA] to-[#F8FBFC] text-gray-800 font-sans flex flex-col relative transition-colors duration-700">
      <Header logoSize={120} />

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

      <main className="flex-1 flex flex-col items-center justify-start mt-12 px-6 w-full">
        <div className="w-full max-w-7xl">

          {/* === HOME === */}
          {vista === "inicio" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.1)] p-12 sm:p-16 flex flex-col gap-12 items-center transition-all duration-500">
              <h1 className="text-6xl font-extrabold text-center text-[#034C7D] tracking-tight animate-fadeIn">
                Odonto<span className="text-[#76C7F3]">AI</span>
              </h1>
              <p className="text-center text-gray-600 text-2xl sm:text-3xl max-w-3xl animate-fadeIn delay-100 leading-relaxed">
                Analiza radiografías dentales con inteligencia artificial, crea sesiones
                colaborativas y potencia el aprendizaje clínico.
              </p>

              {/* BOTONES ARRIBA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-8">
                <button
                  onClick={() => setVista("crear")}
                  className="bg-[#A8DADC] hover:bg-[#9BD1D1] text-[#034C7D] font-bold px-8 py-6 rounded-3xl shadow-lg text-2xl transition-transform transform hover:-translate-y-1 hover:scale-105"
                >
                  Crear sesión
                </button>
                <button
                  onClick={() => setVista("unirse")}
                  className="bg-[#BFD7EA] hover:bg-[#A7C8DF] text-[#034C7D] font-bold px-8 py-6 rounded-3xl shadow-lg text-2xl transition-transform transform hover:-translate-y-1 hover:scale-105"
                >
                  Unirse a sesión
                </button>
                <button
                  onClick={handleGoToTeacherMode}
                  className="bg-[#C8E6C9] hover:bg-[#B5DCB8] text-[#034C7D] font-bold px-8 py-6 rounded-3xl shadow-lg text-2xl transition-transform transform hover:-translate-y-1 hover:scale-105"
                >
                  Modo Docente
                </button>
                <button
                  onClick={handleGoToLeaderboard}
                  className="bg-[#FFF3B0] hover:bg-[#FFEA8A] text-[#034C7D] font-bold px-8 py-6 rounded-3xl shadow-lg text-2xl transition-transform transform hover:-translate-y-1 hover:scale-105"
                >
                  Ranking
                </button>

              </div>

              {/* CARDS ABAJO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 w-full">
                {[{
                  icon: CameraIcon, title: "Analiza", text: "Sube radiografías y obtén un diagnóstico asistido por IA."
                },{
                  icon: GroupIcon, title: "Colabora", text: "Crea sesiones y comparte casos con estudiantes o colegas."
                },{
                  icon: LearnIcon, title: "Aprende", text: "Visualiza métricas y mejora la precisión diagnóstica."
                }].map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-md p-6 hover:shadow-lg transition-all border border-[#E0EDF5] flex flex-col items-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                  >
                    <img src={card.icon} alt={card.title} className="w-12 h-12" />
                    <h3 className="text-2xl font-semibold text-[#034C7D]">{card.title}</h3>
                    <p className="text-gray-600 text-lg">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* === CREAR SESIÓN === */}
          {vista === "crear" && (
            <SessionCreator
              onSesionCreada={handleCrearSesion}
              onVolver={() => setVista("inicio")}
            />
          )}

          {/* === UNIRSE SESIÓN === */}
          {vista === "unirse" && (
            <SessionJoiner
              onSesionUnida={handleUnirseSesion}
              onVolver={() => setVista("inicio")}
            />
          )}

          {/* === DASHBOARD DOCENTE === */}
          {vista === "dashboard" && (
            <SessionDashboard
              codigo={codigoSesion}
              onVolver={() => setVista("inicio")}
            />
          )}

          {/* === VISTA ALUMNO === */}
          {vista === "alumno" && radiografiaURL && (
            <SessionStudentView
              codigo={codigoSesion}
              radiografiaURL={radiografiaURL}
              onVolver={() => setVista("inicio")}
            />
          )}

          {/* === ANALIZANDO === */}
          {vista === "analizando" && radiografiaURL && (
            <Analyzing imageData={radiografiaURL} />
          )}

          {/* === RESULTADO DIAGNÓSTICO === */}
          {vista === "resultado" && radiografiaURL && (
            <DiagnosisResult
              diagnosis={diagnosis}
              confidence={confidence}
              retryCount={retryCount}
              showCorrectOption={true}
              onValidate={handleValidateDiagnosis}
              onRetry={handleRetry}
              onCorrect={handleCorrectDiagnosis}
              onTeacherMode={handleGoToTeacherMode}
            />
          )}

          {/* === MODO DOCENTE === */}
          {vista === "teacher" && (
            <TeacherMode onVolver={() => setVista("inicio")} />
          )}

        {/* === LEADERBOARD === */}
        {vista === "leaderboard" && (
          <Leaderboard onVolver={() => setVista("inicio")} />
        )}

        </div>
      </main>

      {/* BOTÓN FLOTANTE IA */}
        <button
          className="fixed bottom-8 right-8 bg-[#FFD166] text-[#034C7D] font-bold text-2xl sm:text-3xl px-10 py-6 rounded-full 
                    shadow-[8px_8px_20px_rgba(0,0,0,0.15),-8px_-8px_20px_rgba(255,255,255,0.7)] 
                    transition-transform transform hover:-translate-y-1 hover:scale-105 hover:shadow-[4px_4px_12px_rgba(0,0,0,0.2),-4px_-4px_12px_rgba(255,255,255,0.8)] z-50 flex items-center gap-2"
          onClick={() => setIsChatOpen(true)}
        >
          <img src={IaIcon} alt="Asistente IA" className="w-8 h-8" />
          Asistente IA
        </button>

        {/* CHAT ASISTENTE */}
        {isChatOpen && (
          <div className="fixed bottom-24 right-8 z-50">
            <ClinicalAssistant
              diagnosis={diagnosis}
              confidence={confidence}
              onVolver={() => setIsChatOpen(false)}
              onContinuar={() => setIsChatOpen(false)}
            />
          </div>
        )}

        {/* BOTÓN FLOTANTE PARA ABRIR TUTORIAL */}
        <button
          className="fixed bottom-40 right-8 bg-[#FFD166] text-[#034C7D] font-bold px-6 py-3 rounded-full z-50"
          onClick={() => setShowTutorial(true)}
        >
          Abrir Tutorial
        </button>

        {/* TUTORIAL */}
        {showTutorial && (
          <TutorialDental
            onClose={() => setShowTutorial(false)}
          />
        )}

    </div>
  );
}

export default App;
