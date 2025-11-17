import React, { useState } from "react";
import TeacherSvg from "../assets/img/teacher.svg";
import { motion, AnimatePresence } from "framer-motion";
import { showCustomToast } from "./CustomToast";

interface Caso {
  pregunta: string;
  opciones: string[];
  correcta: string;
  dificultad: "baja" | "media" | "alta";
  explicacion: string;
}

interface TeacherModeProps {
  onVolver: () => void;
  onFinalizar: (casos: Caso[]) => void;
}

const TeacherMode: React.FC<TeacherModeProps> = ({ onVolver, onFinalizar }) => {
  const [caseData, setCaseData] = useState<Caso>({
    pregunta: "",
    opciones: ["", "", "", ""],
    correcta: "",
    dificultad: "media",
    explicacion: "",
  });

  const [casosRegistrados, setCasosRegistrados] = useState<Caso[]>([]);
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  const handleChange = (field: keyof Caso, value: string, index?: number) => {
    if (field === "opciones" && typeof index === "number") {
      const newOpciones = [...caseData.opciones];
      newOpciones[index] = value;
      setCaseData({ ...caseData, opciones: newOpciones });
    } else {
      setCaseData({ ...caseData, [field]: value } as any);
    }
  };

  const handleSave = () => {
    if (!caseData.pregunta || !caseData.correcta) {
      showCustomToast("Debes completar la pregunta y la respuesta correcta", TeacherSvg);
      return;
    }

    // Validar que al menos 2 opciones estén completas
    const opcionesCompletas = caseData.opciones.filter(opt => opt.trim() !== "").length;
    if (opcionesCompletas < 2) {
      showCustomToast("Debes completar al menos 2 opciones", TeacherSvg);
      return;
    }

    setCasosRegistrados([...casosRegistrados, caseData]);
    showCustomToast("Pregunta guardada correctamente", TeacherSvg);
    
    // Resetear formulario para nueva pregunta
    setCaseData({
      pregunta: "",
      opciones: ["", "", "", ""],
      correcta: "",
      dificultad: "media",
      explicacion: "",
    });

    // Ocultar formulario después de guardar
    setMostrarFormulario(false);
  };

  const handleAgregarOtraPregunta = () => {
    setMostrarFormulario(true);
  };

  const handleFinalizar = () => {
    if (casosRegistrados.length === 0) {
      showCustomToast("Debes guardar al menos una pregunta antes de finalizar", TeacherSvg);
      return;
    }

    setFinalizando(true);
    setTimeout(() => {
      onFinalizar(casosRegistrados);
    }, 1500);
  };

  const resetFormulario = () => {
    setCaseData({
      pregunta: "",
      opciones: ["", "", "", ""],
      correcta: "",
      dificultad: "media",
      explicacion: "",
    });
    setMostrarFormulario(true);
  };

  return (
    <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-8 mx-4 sm:mx-auto flex flex-col gap-6 relative">

      <AnimatePresence>
        {finalizando && (
          <motion.div
            className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={TeacherSvg}
              className="w-40 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
            <motion.p
              className="text-3xl font-bold text-[#034C7D]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ¡Caso finalizado!
            </motion.p>
            <motion.p
              className="text-lg text-gray-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {casosRegistrados.length} pregunta(s) guardada(s)
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <img src={TeacherSvg} alt="Modo Docente" className="w-32 h-32 mx-auto" />

      <h2 className="text-4xl font-bold text-[#034C7D] text-center mt-4">
        Modo docente — Crear caso
      </h2>

      <div className="flex gap-2 justify-center mb-4">
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          casosRegistrados.length > 0 
            ? "bg-green-100 text-green-700" 
            : "bg-gray-100 text-gray-500"
        }`}>
          {casosRegistrados.length} pregunta(s) guardada(s)
        </div>
      </div>

      <AnimatePresence>
        {mostrarFormulario ? (
          <motion.div
            className="flex flex-col gap-4 mt-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              placeholder="Pregunta"
              value={caseData.pregunta}
              onChange={(e) => handleChange("pregunta", e.target.value)}
              className="border border-[#E0E0E0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#76C7F3]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {caseData.opciones.map((opt, i) => (
                <input
                  key={i}
                  placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => handleChange("opciones", e.target.value, i)}
                  className="border border-[#E0E0E0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#76C7F3]"
                />
              ))}
            </div>

            <select
              value={caseData.correcta}
              onChange={(e) => handleChange("correcta", e.target.value)}
              className="border border-[#E0E0E0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#76C7F3]"
            >
              <option value="">Selecciona la respuesta correcta</option>
              {caseData.opciones.map((opt, i) => (
                <option key={i} value={opt} disabled={!opt.trim()}>
                  {opt || `Opción ${String.fromCharCode(65 + i)}`}
                </option>
              ))}
            </select>

            <select
              value={caseData.dificultad}
              onChange={(e) => handleChange("dificultad", e.target.value)}
              className="border border-[#E0E0E0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#91D18B]"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>

            <textarea
              placeholder="Explicación del caso"
              value={caseData.explicacion}
              onChange={(e) => handleChange("explicacion", e.target.value)}
              className="border border-[#E0E0E0] rounded-xl p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#76C7F3]"
            />

            <div className="flex justify-between gap-4 mt-4">
              <button
                onClick={() => {
                  resetFormulario();
                  setMostrarFormulario(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-3 rounded-xl transition flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-[#91D18B] hover:bg-[#75b472] text-white px-6 py-3 rounded-xl transition flex-1"
              >
                Guardar pregunta
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-8 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg text-gray-600 text-center">
              {casosRegistrados.length === 0 
                ? "No hay preguntas guardadas" 
                : `${casosRegistrados.length} pregunta(s) guardada(s)`}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleAgregarOtraPregunta}
                className="bg-[#76C7F3] hover:bg-[#5ba8d0] text-white px-6 py-3 rounded-xl transition"
              >
                Agregar otra pregunta
              </button>
              {casosRegistrados.length > 0 && (
                <button
                  onClick={handleFinalizar}
                  className="bg-[#F7C948] hover:bg-[#E1C650] text-white px-6 py-3 rounded-xl transition"
                >
                  Finalizar caso
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {casosRegistrados.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-[#034C7D] mb-4">Preguntas Guardadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {casosRegistrados.map((c, i) => (
              <motion.div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-[#E0EDF5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-semibold text-[#034C7D] mb-2">{c.pregunta}</p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Correcta:</span> {c.correcta}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Dificultad:</span> 
                  <span className={`capitalize ${
                    c.dificultad === "alta" ? "text-red-500" :
                    c.dificultad === "media" ? "text-yellow-500" : "text-green-500"
                  }`}>
                    {" "}{c.dificultad}
                  </span>
                </p>
                {c.explicacion && (
                  <p className="text-gray-500 text-sm mt-2">
                    <span className="font-medium">Explicación:</span> {c.explicacion}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onVolver}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-xl transition"
        >
          Volver al inicio
        </button>
        
        {casosRegistrados.length > 0 && !mostrarFormulario && (
          <button
            onClick={handleFinalizar}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition"
          >
            Guardar y finalizar Caso
          </button>
        )}
      </div>

    </div>
  );
};

export default TeacherMode;