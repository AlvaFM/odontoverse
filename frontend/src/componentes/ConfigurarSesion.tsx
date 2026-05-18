import { useState } from "react";
import { supabase } from "../lib/supabase";
import SalaProfesor from "./SalaProfesor";

interface Props {
  codigoSesion: string;
  diagnostico: string;
  profesorEmail: string;
  onVolver: () => void;
}

interface PreguntaConfig {
  texto: string;
  tipo: "texto" | "multiple";
  opciones: string[];
}

export default function ConfigurarSesion({
  codigoSesion,
  diagnostico,
  profesorEmail,
  onVolver,
}: Props) {
  const [preguntas, setPreguntas] = useState<PreguntaConfig[]>([
    { texto: "", tipo: "texto", opciones: ["", ""] }
  ]);
  const [tiempo, setTiempo] = useState(10);
  const [continuar, setContinuar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (!codigoSesion || codigoSesion.trim() === "") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
        <div className="text-center">
          <p className="text-red-500">Error: Código de sesión inválido</p>
          <button onClick={onVolver} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const agregarPregunta = () => {
    setPreguntas([...preguntas, { texto: "", tipo: "texto", opciones: ["", ""] }]);
  };

  const actualizarTexto = (index: number, valor: string) => {
    const nuevas = [...preguntas];
    nuevas[index].texto = valor;
    setPreguntas(nuevas);
  };

  const actualizarTipo = (index: number, tipo: "texto" | "multiple") => {
    const nuevas = [...preguntas];
    nuevas[index].tipo = tipo;
    if (tipo === "multiple" && nuevas[index].opciones.length < 2) {
      nuevas[index].opciones = ["", ""];
    }
    setPreguntas(nuevas);
  };

  const actualizarOpcion = (preguntaIndex: number, opcionIndex: number, valor: string) => {
    const nuevas = [...preguntas];
    nuevas[preguntaIndex].opciones[opcionIndex] = valor;
    setPreguntas(nuevas);
  };

  const agregarOpcion = (preguntaIndex: number) => {
    const nuevas = [...preguntas];
    if (nuevas[preguntaIndex].opciones.length < 4) {
      nuevas[preguntaIndex].opciones.push("");
      setPreguntas(nuevas);
    }
  };

  const eliminarOpcion = (preguntaIndex: number, opcionIndex: number) => {
    const nuevas = [...preguntas];
    nuevas[preguntaIndex].opciones.splice(opcionIndex, 1);
    setPreguntas(nuevas);
  };

  const guardarConfiguracion = async () => {
    const preguntasValidas = preguntas.filter(p => p.texto.trim() !== "");
    
    if (preguntasValidas.length === 0) {
      setError("Agrega al menos una pregunta");
      return;
    }

    // Validar preguntas múltiples
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (p.texto.trim() !== "") {
        if (p.tipo === "multiple") {
          const opcionesValidas = p.opciones.filter(opt => opt.trim() !== "");
          if (opcionesValidas.length < 2) {
            setError(`La pregunta "${p.texto}" debe tener al menos 2 opciones`);
            return;
          }
        }
      }
    }

    if (tiempo <= 0) {
      setError("El tiempo debe ser mayor a 0");
      return;
    }

    setGuardando(true);
    setError("");

    // Actualizar tiempo
    const { error: errorSesion } = await supabase
      .from("sesiones")
      .update({ tiempo_limite: tiempo * 60 })
      .eq("codigo", codigoSesion);

    if (errorSesion) {
      setError("Error al guardar configuración: " + errorSesion.message);
      setGuardando(false);
      return;
    }

    // Eliminar preguntas anteriores
    await supabase.from("preguntas").delete().eq("sesion_codigo", codigoSesion);

    // Guardar nuevas preguntas
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (p.texto.trim() === "") continue;

      const opcionesValidas = p.tipo === "multiple" 
        ? p.opciones.filter(opt => opt.trim() !== "")
        : null;

      console.log("Guardando pregunta:", {
        texto: p.texto.trim(),
        tipo: p.tipo,
        opciones: opcionesValidas
      });

      const { error: errorPregunta } = await supabase
        .from("preguntas")
        .insert([{
          sesion_codigo: codigoSesion,
          texto: p.texto.trim(),
          orden: i,
          tipo: p.tipo,
          opciones: opcionesValidas
        }]);

      if (errorPregunta) {
        console.error("Error al guardar pregunta:", errorPregunta);
        setError("Error al guardar las preguntas: " + errorPregunta.message);
        setGuardando(false);
        return;
      }
    }

    setGuardando(false);
    setContinuar(true);
  };

  if (continuar) {
    // Pasar preguntas completas a SalaProfesor
    const preguntasCompletas = preguntas
      .filter(p => p.texto.trim() !== "")
      .map(p => ({
        texto: p.texto,
        tipo: p.tipo,
        opciones: p.tipo === "multiple" ? p.opciones.filter(opt => opt.trim() !== "") : undefined
      }));
    
    return (
      <SalaProfesor
        codigoSesion={codigoSesion}
        preguntas={preguntasCompletas}
        tiempo={tiempo}
        profesorEmail={profesorEmail}
        onVolver={onVolver}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbfd] py-8 px-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Configurar sesión clínica</h2>
          <button onClick={onVolver} className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition">
            ← Volver
          </button>
        </div>

        <div className="bg-[#f0f8ff] rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-slate-500">Sesión</p>
          <p className="font-semibold text-[#1e3a5f]">{codigoSesion}</p>
        </div>

        <div className="bg-[#f0f8ff] rounded-xl p-3 mb-6 text-center">
          <p className="text-sm text-slate-500">Diagnóstico confirmado</p>
          <p className="font-semibold text-[#1e3a5f]">{diagnostico}</p>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-600 mb-2 block">Tiempo (minutos)</label>
          <input
            type="number"
            min="1"
            value={tiempo}
            onChange={(e) => setTiempo(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-xl bg-[#f7fbfd] border border-[#cfeaf6] focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-600 mb-2 block">Preguntas clínicas</label>
          
          <div className="space-y-6">
            {preguntas.map((pregunta, idx) => (
              <div key={idx} className="border border-[#cfeaf6] rounded-xl p-4 bg-[#fafdff]">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-[#1e3a5f]">Pregunta {idx + 1}</span>
                  {idx > 0 && (
                    <button
                      onClick={() => {
                        const nuevas = [...preguntas];
                        nuevas.splice(idx, 1);
                        setPreguntas(nuevas);
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Escribe la pregunta..."
                  value={pregunta.texto}
                  onChange={(e) => actualizarTexto(idx, e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#cfeaf6] focus:outline-none focus:ring-2 focus:ring-[#9ecbff] mb-3"
                />

                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name={`tipo_${idx}`}
                      checked={pregunta.tipo === "texto"}
                      onChange={() => actualizarTipo(idx, "texto")}
                      className="text-[#9ecbff]"
                    />
                    Texto libre
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name={`tipo_${idx}`}
                      checked={pregunta.tipo === "multiple"}
                      onChange={() => actualizarTipo(idx, "multiple")}
                      className="text-[#9ecbff]"
                    />
                    Opción múltiple
                  </label>
                </div>

                {pregunta.tipo === "multiple" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#cfeaf6]">
                    <p className="text-xs text-slate-500 mb-2">Opciones de respuesta</p>
                    {pregunta.opciones.map((opcion, optIdx) => (
                      <div key={optIdx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={`Opción ${optIdx + 1}`}
                          value={opcion}
                          onChange={(e) => actualizarOpcion(idx, optIdx, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#cfeaf6] text-sm focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
                        />
                        {pregunta.opciones.length > 2 && (
                          <button
                            onClick={() => eliminarOpcion(idx, optIdx)}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {pregunta.opciones.length < 4 && (
                      <button
                        onClick={() => agregarOpcion(idx)}
                        className="text-sm text-[#1e3a5f] hover:text-[#81b0d6] transition mt-1"
                      >
                        + Agregar opción
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={agregarPregunta}
            className="mt-4 text-sm text-[#1e3a5f] hover:text-[#81b0d6] transition flex items-center gap-1"
          >
            + Agregar pregunta
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="w-full py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50 font-medium"
        >
          {guardando ? "Guardando..." : "Abrir sala"}
        </button>
      </div>
    </div>
  );
}