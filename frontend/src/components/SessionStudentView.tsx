import { useState } from "react";
import Leaderboard from "./Leaderboard";

interface Props {
  codigo: string;
  radiografiaURL?: string | null;
  onVolver: () => void;
  preguntas?: Pregunta[];
}

interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: string;
  dificultad: "baja" | "media" | "alta";
  explicacion: string;
}

export default function SessionStudentView({
  codigo,
  radiografiaURL,
  onVolver,
  preguntas = [],
}: Props) {
  const [respuestas, setRespuestas] = useState<{ [key: number]: string }>({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [mostrarLeaderboard, setMostrarLeaderboard] = useState(false);

  const manejarRespuesta = (opcion: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaActual]: opcion,
    }));
  };

  const siguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setMostrarLeaderboard(true);
    }
  };

  // 👉 MOSTRAR LEADERBOARD
  if (mostrarLeaderboard) {
    return (
      <div className="p-6">
        <Leaderboard onVolver={onVolver} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-4xl mx-auto flex flex-col gap-6 border border-[#E5E5E5]">

      {/* Título */}
      <h2 className="text-3xl font-bold text-[#034C7D] text-center">
        Sesión {codigo}
      </h2>

      {/* Imagen */}
      {radiografiaURL && (
        <img
          src={radiografiaURL}
          alt="Radiografía"
          className="max-h-64 mx-auto rounded-2xl border shadow"
        />
      )}

      {/* Contenido de preguntas */}
      {preguntas.length > 0 ? (
        <div className="bg-[#fafefe] rounded-2xl p-6 border shadow">

          <p className="text-[#034C7D] font-bold mb-2 text-center">
            Pregunta {preguntaActual + 1} de {preguntas.length}
          </p>

          <p className="text-gray-800 mb-6 font-medium text-center">
            {preguntas[preguntaActual].pregunta}
          </p>

          <div className="space-y-3">
            {preguntas[preguntaActual].opciones.map((opcion, i) => (
              <button
                key={i}
                onClick={() => manejarRespuesta(opcion)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  respuestas[preguntaActual] === opcion
                    ? "bg-[#cafaf7] text-[#034C7D] border-[#bdeeee]"
                    : "bg-white hover:bg-[#ecfaf8]"
                }`}
              >
                <b className="mr-2">{String.fromCharCode(65 + i)}.</b>{" "}
                {opcion}
              </button>
            ))}
          </div>

          {/* Botón siguiente */}
          <div className="flex justify-center mt-6">
            <button
              onClick={siguiente}
              className="px-6 py-3 rounded-full font-semibold shadow transition-all bg-[#d0f5e1] hover:bg-[#a3c7b4] text-gray-700"
            >
              {preguntaActual === preguntas.length - 1
                ? "Ver ranking"
                : "Siguiente"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No hay preguntas para esta sesión.
        </div>
      )}

      {/* Salir */}
      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline text-center"
      >
        Salir de la sesión
      </button>
    </div>
  );
}
