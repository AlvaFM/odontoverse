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
  onFinalizar: () => void;
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
    setCasosRegistrados([...casosRegistrados, caseData]);
    showCustomToast("Caso registrado correctamente", TeacherSvg);
    setCaseData({
      pregunta: "",
      opciones: ["", "", "", ""],
      correcta: "",
      dificultad: "media",
      explicacion: "",
    });
  };

  const handleFinalizar = () => {
    if (casosRegistrados.length === 0) {
      showCustomToast("Debes guardar al menos un caso antes de finalizar", TeacherSvg);
      return;
    }

    setFinalizando(true);
    setTimeout(() => {
      onFinalizar();
    }, 1500);
  };

  return (
    <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-8 mx-4 sm:mx-auto flex flex-col gap-6 relative">

      <AnimatePresence>
        {finalizando && (
          <motion.div
            className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl"
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
          </motion.div>
        )}
      </AnimatePresence>

      <img src={TeacherSvg} alt="Modo Docente" className="w-32 h-32 mx-auto" />

      <h2 className="text-4xl font-bold text-[#034C7D] text-center mt-4">
        Modo docente — Crear caso
      </h2>

      <div className="flex flex-col gap-4 mt-6">
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
              placeholder={`Opción ${i + 1}`}
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
            <option key={i} value={opt}>
              {opt || `Opción ${i + 1}`}
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
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={onVolver}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-xl transition"
        >
          Volver
        </button>
        <button
          onClick={handleSave}
          className="bg-[#91D18B] hover:bg-[#75b472] text-white px-6 py-2 rounded-xl transition"
        >
          Guardar caso
        </button>
      </div>

      {casosRegistrados.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-[#034C7D] mb-4">Casos Registrados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {casosRegistrados.map((c, i) => (
              <motion.div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-[#E0EDF5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-semibold text-[#034C7D]">{c.pregunta}</p>
                <p className="text-gray-600 text-sm">Respuesta correcta: {c.correcta}</p>
                <p className="text-gray-500 text-sm">Dificultad: {c.dificultad}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleFinalizar}
        className="bg-blue-500 text-white px-6 py-2 rounded-xl"
      >
        Guardar y finalizar Caso
      </button>

    </div>
  );
};

export default TeacherMode;
