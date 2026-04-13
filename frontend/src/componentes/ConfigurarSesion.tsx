import { useState } from "react";
import { supabase } from "../lib/supabase";
import SalaProfesor from "./SalaProfesor";

interface Props {
  codigoSesion: string;
  diagnostico: string;
  profesorEmail: string;
}

export default function ConfigurarSesion({
  codigoSesion,
  diagnostico,
  profesorEmail,
}: Props) {
  const [preguntas, setPreguntas] = useState([""]);
  const [tiempo, setTiempo] = useState(10);
  const [continuar, setContinuar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const agregarPregunta = () => {
    setPreguntas([...preguntas, ""]);
  };

  const actualizarPregunta = (index: number, valor: string) => {
    const nuevas = [...preguntas];
    nuevas[index] = valor;
    setPreguntas(nuevas);
  };

  const guardarConfiguracion = async () => {
    // Validar que haya al menos una pregunta
    const preguntasValidas = preguntas.filter(p => p.trim() !== "");
    if (preguntasValidas.length === 0) {
      setError("Agrega al menos una pregunta");
      return;
    }

    if (tiempo <= 0) {
      setError("El tiempo debe ser mayor a 0");
      return;
    }

    setGuardando(true);
    setError("");

    // 1. Actualizar la sesión con el tiempo límite (sin diagnostico_confirmado)
    const { error: errorSesion } = await supabase
      .from("sesiones")
      .update({ 
        tiempo_limite: tiempo * 60 // Convertir a segundos
      })
      .eq("codigo", codigoSesion);

    if (errorSesion) {
      setError("Error al guardar configuración: " + errorSesion.message);
      setGuardando(false);
      return;
    }

    // 2. Eliminar preguntas anteriores si existían
    const { error: errorDelete } = await supabase
      .from("preguntas")
      .delete()
      .eq("sesion_codigo", codigoSesion);

    if (errorDelete) {
      console.error("Error al eliminar preguntas anteriores:", errorDelete);
    }

    // 3. Guardar las nuevas preguntas
    for (let i = 0; i < preguntasValidas.length; i++) {
      const { error: errorPregunta } = await supabase
        .from("preguntas")
        .insert([{
          sesion_codigo: codigoSesion,
          texto: preguntasValidas[i],
          orden: i,
          tipo: "texto"
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
    return (
      <SalaProfesor
        codigoSesion={codigoSesion}
        preguntas={preguntas.filter(p => p.trim() !== "")}
        tiempo={tiempo}
        profesorEmail={profesorEmail}
      />
    );
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">

    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">

      {/* HEADER */}
      <h2 className="text-xl font-semibold text-[#1e3a5f] text-center mb-6">
        Configurar sesión clínica
      </h2>

      {/* INFO */}
      <div className="bg-[#f0f8ff] rounded-xl p-3 mb-4 text-center">
        <p className="text-sm text-slate-500">Sesión activa</p>
        <p className="font-semibold text-[#1e3a5f]">{codigoSesion}</p>
      </div>

      <div className="bg-[#f0f8ff] rounded-xl p-3 mb-6 text-center">
        <p className="text-sm text-slate-500">Diagnóstico IA</p>
        <p className="font-semibold text-[#1e3a5f]">{diagnostico}</p>
      </div>

      {/* TIEMPO */}
      <div className="mb-6">
        <p className="text-sm text-slate-600 mb-2">Tiempo (minutos)</p>

        <input
          type="number"
          min="1"
          value={tiempo}
          onChange={(e) => setTiempo(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-xl bg-[#f7fbfd] border border-[#cfeaf6]
                     focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
        />
      </div>

      {/* PREGUNTAS */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-2">Preguntas clínicas</p>

        <p className="text-xs text-slate-400 mb-3">
          Respuesta libre de los alumnos
        </p>

        <div className="space-y-2">
          {preguntas.map((pregunta, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Pregunta ${index + 1}`}
              value={pregunta}
              onChange={(e) => actualizarPregunta(index, e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#f7fbfd] border border-[#cfeaf6]
                         focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
            />
          ))}
        </div>

        <button
          onClick={agregarPregunta}
          className="mt-3 text-sm text-[#1e3a5f] hover:text-[#81b0d6] transition"
        >
          + Agregar pregunta
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm text-center mb-4">
          {error}
        </p>
      )}

      {/* BOTÓN */}
      <button
        onClick={guardarConfiguracion}
        disabled={guardando}
        className="
          w-full py-3 rounded-xl text-sm font-medium
          bg-[#9ecbff] text-[#1e3a5f]
          hover:bg-[#81b0d6]
          transition
          disabled:opacity-50
        "
      >
        {guardando ? "Guardando..." : "Abrir sala"}
      </button>

    </div>
  </div>
);
}