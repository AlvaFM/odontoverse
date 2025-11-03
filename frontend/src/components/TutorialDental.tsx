import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dienteImg from "../assets/img/dientelike.png";

interface Step {
  id: number;
  description: string;
  targetTop: string;
  centerHorizontal?: boolean;
  offsetTop?: string;
}

interface TutorialDentalProps {
  onClose: () => void;
}

const steps: Step[] = [
  {
    id: 1,
    description:
      "¡Hola! Este es el botón Crear sesión, donde puedes iniciar nuevas sesiones de estudio.",
    targetTop: "20%",
  },
  {
    id: 2,
    description:
      "Este es Unirse a sesión, para que los estudiantes se unan a casos creados por docentes.",
    targetTop: "20%",
  },
  {
    id: 3,
    description:
      "Modo Docente: accede a funciones avanzadas para gestionar sesiones y revisar casos.",
    targetTop: "20%",
  },
  {
    id: 4,
    description: "Ranking: consulta el desempeño de los estudiantes y su progreso.",
    targetTop: "20%",
  },
  {
    id: 5,
    description: "Aquí está la card Analiza, que resume una función de la app.",
    targetTop: "65%",
    offsetTop: "-15px",
  },
  {
    id: 6,
    description: "Aquí está la card Colabora, que resume otra función de la app.",
    targetTop: "65%",
    centerHorizontal: true,
    offsetTop: "-15px",
  },
  {
    id: 7,
    description: "Aquí está la card Aprende, que resume la última función de la app.",
    targetTop: "65%",
    offsetTop: "-15px",
  },
  {
    id: 8,
    description: "Y eso sería el 'toothorial' por el momento ¡Buena suerte! :)",
    targetTop: "50%",
    centerHorizontal: true,
    offsetTop: "-20px",
  },
];

export default function TutorialDental({ onClose }: TutorialDentalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  // Determina left según step, usando solo porcentajes para mantener proporción
  const getLeft = () => {
    if (step.centerHorizontal) return "50%";
    switch (step.id) {
      case 1:
        return "26%"; // Crear sesión
      case 2:
        return "38%"; // Unirse a sesión
      case 3:
        return "50%"; // Modo Docente
      case 4:
        return "61%"; // Ranking
      case 5:
        return "30%"; // card Analiza
      case 7:
        return "70%"; // card Aprende
      default:
        return "20%";
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={activeStep}
          className="absolute flex flex-col items-center pointer-events-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: `calc(${step.targetTop} + ${step.offsetTop || "0px"})`,
            left: getLeft(),
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          style={{ transform: step.centerHorizontal ? "translateX(-50%)" : "none" }}
        >
          {/* Mascota */}
          <img src={dienteImg} alt="DienteLike" className="w-24 h-auto object-contain" />

          {/* Indicador de progreso */}
          {!isLastStep && (
            <div className="mt-2 text-white font-semibold text-sm">
              Paso {activeStep + 1}/{steps.length - 1}
            </div>
          )}

          {/* Texto flotante */}
          <div
            className={`mt-2 w-64 sm:w-72 md:w-80 text-white font-semibold text-center p-3 rounded-lg shadow-lg ${
              isLastStep ? "bg-green-500" : "bg-black/60"
            }`}
          >
            {step.description}
          </div>

          {/* Botones */}
          {!isLastStep ? (
            <div className="mt-4 flex gap-4 justify-center">
              <button
                onClick={handlePrev}
                disabled={activeStep === 0}
                className={`px-4 py-2 rounded-full ${
                  activeStep === 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-300 text-white"
                }`}
              >
                Anterior
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-white"
              >
                Siguiente
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-white"
              >
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
