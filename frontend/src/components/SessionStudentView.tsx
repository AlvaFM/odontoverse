import { useState } from "react";

interface Props {
  codigo: string;
  radiografiaURL?: string | null;
  onVolver: () => void;
  preguntas?: Pregunta[]; // Nuevo prop para las preguntas
}

interface Diente {
  fdi: string;
  nombre: string;
}

interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: string;
  dificultad: "baja" | "media" | "alta";
  explicacion: string;
}

const dientesSuperiores: Diente[] = [
  { fdi: "18", nombre: "Tercer Molar" }, { fdi: "17", nombre: "Segundo Molar" },
  { fdi: "16", nombre: "Primer Molar" }, { fdi: "15", nombre: "Segundo Premolar" },
  { fdi: "14", nombre: "Primer Premolar" }, { fdi: "13", nombre: "Canino" },
  { fdi: "12", nombre: "Incisivo Lat." }, { fdi: "11", nombre: "Incisivo Cen." },
  { fdi: "21", nombre: "Incisivo Cen." }, { fdi: "22", nombre: "Incisivo Lat." },
  { fdi: "23", nombre: "Canino" }, { fdi: "24", nombre: "Primer Premolar" },
  { fdi: "25", nombre: "Segundo Premolar" }, { fdi: "26", nombre: "Primer Molar" },
  { fdi: "27", nombre: "Segundo Molar" }, { fdi: "28", nombre: "Tercer Molar" },
];

const dientesInferiores: Diente[] = [
  { fdi: "48", nombre: "Tercer Molar" }, { fdi: "47", nombre: "Segundo Molar" },
  { fdi: "46", nombre: "Primer Molar" }, { fdi: "45", nombre: "Segundo Premolar" },
  { fdi: "44", nombre: "Primer Premolar" }, { fdi: "43", nombre: "Canino" },
  { fdi: "42", nombre: "Incisivo Lat." }, { fdi: "41", nombre: "Incisivo Cen." },
  { fdi: "31", nombre: "Incisivo Cen." }, { fdi: "32", nombre: "Incisivo Lat." },
  { fdi: "33", nombre: "Canino" }, { fdi: "34", nombre: "Primer Premolar" },
  { fdi: "35", nombre: "Segundo Premolar" }, { fdi: "36", nombre: "Primer Molar" },
  { fdi: "37", nombre: "Segundo Molar" }, { fdi: "38", nombre: "Tercer Molar" },
];

const diagnosticos = ["Caries", "Fractura", "Restauración"];

export default function SessionStudentView({ codigo, radiografiaURL, onVolver, preguntas = [] }: Props) {
  const [dienteSeleccionado, setDienteSeleccionado] = useState<Diente | null>(null);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<string | null>(null);
  const [respuestasPreguntas, setRespuestasPreguntas] = useState<{[key: number]: string}>({});
  const [preguntaActual, setPreguntaActual] = useState(0);

  const enviarDiagnostico = () => {
    if (!dienteSeleccionado || !diagnosticoSeleccionado) {
      alert("Selecciona un diente y un diagnóstico antes de enviar");
      return;
    }
    
    // Verificar que todas las preguntas estén respondidas
    if (preguntas.length > 0) {
      const preguntasSinResponder = preguntas.filter((_, index) => !respuestasPreguntas[index]);
      if (preguntasSinResponder.length > 0) {
        alert("Debes responder todas las preguntas antes de enviar");
        return;
      }
    }
    
    const datosEnvio = {
      diente: `${dienteSeleccionado.fdi} (${dienteSeleccionado.nombre})`,
      diagnostico: diagnosticoSeleccionado,
      respuestas: respuestasPreguntas
    };
    
    alert(`Análisis enviado:\nDiente: ${datosEnvio.diente}\nDiagnóstico: ${datosEnvio.diagnostico}\nPreguntas respondidas: ${Object.keys(datosEnvio.respuestas).length}`);
    
    // Resetear formulario
    setDienteSeleccionado(null);
    setDiagnosticoSeleccionado(null);
    setRespuestasPreguntas({});
    setPreguntaActual(0);
  };

  const manejarRespuestaPregunta = (preguntaIndex: number, opcion: string) => {
    setRespuestasPreguntas(prev => ({
      ...prev,
      [preguntaIndex]: opcion
    }));
  };

  const siguientePregunta = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-6xl mx-4 sm:mx-auto flex flex-col gap-6 border border-[#D0D0D0]">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#034C7D] text-center">
        Sesión {codigo}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Radiografía y dientes */}
        <div className="flex flex-col">
          {radiografiaURL && (
            <div className="mb-6">
              <img
                src={radiografiaURL}
                alt="Radiografía"
                className="max-h-64 w-full object-contain rounded-xl border border-[#E0E0E0] shadow-md mx-auto"
              />
            </div>
          )}

          <p className="text-[#034C7D] mb-4 font-medium text-center">Selecciona el diente afectado:</p>

          {/* Dientes superiores */}
          <div className="flex justify-center mb-2 gap-2 flex-wrap">
            {dientesSuperiores.map((diente, i) => (
              <button
                key={diente.fdi}
                onClick={() => setDienteSeleccionado(diente)}
                className={`w-14 h-16 rounded-t-2xl border border-[#E0E0E0] flex flex-col justify-center items-center text-xs shadow-md transition-all duration-200 ${
                  dienteSeleccionado?.fdi === diente.fdi
                    ? "bg-[#76C7F3] text-white scale-105"
                    : "bg-white hover:bg-[#BDE0F7]"
                }`}
                style={{ transform: `translateY(${Math.sin(i / 16 * Math.PI) * -5}px)` }}
              >
                <span className="font-bold">{diente.fdi}</span>
                <span className="text-[10px] leading-tight text-center">{diente.nombre.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Dientes inferiores */}
          <div className="flex justify-center mb-4 gap-2 flex-wrap">
            {dientesInferiores.map((diente, i) => (
              <button
                key={diente.fdi}
                onClick={() => setDienteSeleccionado(diente)}
                className={`w-14 h-16 rounded-b-2xl border border-[#E0E0E0] flex flex-col justify-center items-center text-xs shadow-md transition-all duration-200 ${
                  dienteSeleccionado?.fdi === diente.fdi
                    ? "bg-[#76C7F3] text-white scale-105"
                    : "bg-white hover:bg-[#BDE0F7]"
                }`}
                style={{ transform: `translateY(${Math.sin(i / 16 * Math.PI) * 5}px)` }}
              >
                <span className="font-bold">{diente.fdi}</span>
                <span className="text-[10px] leading-tight text-center">{diente.nombre.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Selección de análisis */}
          {dienteSeleccionado && (
            <>
              <p className="text-[#034C7D] mb-2 font-medium text-center">Selecciona el análisis:</p>
              <div className="flex justify-center gap-3 mb-6 flex-wrap">
                {diagnosticos.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiagnosticoSeleccionado(d)}
                    className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-200 text-sm ${
                      diagnosticoSeleccionado === d ? "bg-[#76C7F3] text-white scale-105" : "bg-white hover:bg-[#BDE0F7]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Columna derecha - Preguntas del teacher mode */}
        <div className="flex flex-col">
          {preguntas.length > 0 ? (
            <div className="bg-[#F8FBFF] rounded-2xl p-6 border border-[#E0EDF5] shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#034C7D]">
                  Pregunta {preguntaActual + 1} de {preguntas.length}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  preguntas[preguntaActual].dificultad === "alta" ? "bg-red-100 text-red-700" :
                  preguntas[preguntaActual].dificultad === "media" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  Dificultad: {preguntas[preguntaActual].dificultad}
                </span>
              </div>

              <p className="text-lg font-medium text-gray-800 mb-6">
                {preguntas[preguntaActual].pregunta}
              </p>

              <div className="space-y-3 mb-6">
                {preguntas[preguntaActual].opciones.map((opcion, index) => (
                  opcion && (
                    <button
                      key={index}
                      onClick={() => manejarRespuestaPregunta(preguntaActual, opcion)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        respuestasPreguntas[preguntaActual] === opcion
                          ? "bg-[#76C7F3] text-white border-[#5AB0E1] shadow-md"
                          : "bg-white border-gray-200 hover:bg-[#E8F4FD] hover:border-[#76C7F3]"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-semibold mr-3">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{opcion}</span>
                      </div>
                    </button>
                  )
                ))}
              </div>

              {/* Navegación entre preguntas */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={preguntaAnterior}
                  disabled={preguntaActual === 0}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    preguntaActual === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  Anterior
                </button>

                <button
                  onClick={siguientePregunta}
                  disabled={preguntaActual === preguntas.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    preguntaActual === preguntas.length - 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#76C7F3] text-white hover:bg-[#5AB0E1]"
                  }`}
                >
                  Siguiente
                </button>
              </div>

              {/* Indicador de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso de preguntas:</span>
                  <span>{Object.keys(respuestasPreguntas).length}/{preguntas.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#76C7F3] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(respuestasPreguntas).length / preguntas.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8FBFF] rounded-2xl p-8 border border-[#E0EDF5] shadow-md text-center">
              <p className="text-gray-600 mb-4">No hay preguntas disponibles para esta sesión</p>
              <p className="text-sm text-gray-500">El docente aún no ha agregado preguntas</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón de enviar */}
      <button
        onClick={enviarDiagnostico}
        disabled={!dienteSeleccionado || !diagnosticoSeleccionado || (preguntas.length > 0 && Object.keys(respuestasPreguntas).length < preguntas.length)}
        className={`px-6 py-3 rounded-full w-full font-semibold shadow-md transition-all duration-200 ${
          !dienteSeleccionado || !diagnosticoSeleccionado || (preguntas.length > 0 && Object.keys(respuestasPreguntas).length < preguntas.length)
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#76C7F3] hover:bg-[#5AB0E1] text-white transform hover:-translate-y-1 hover:scale-105"
        }`}
      >
        {preguntas.length > 0 ? "Enviar análisis y respuestas" : "Enviar análisis"}
      </button>

      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline text-center"
      >
        Salir de la sesión
      </button>
    </div>
  );
}