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
    <div style={{ padding: "1rem" }}>
      <h2>Configurar sesión clínica</h2>

      <p><strong>Sesión:</strong> {codigoSesion}</p>
      <p><strong>Diagnóstico confirmado:</strong> {diagnostico}</p>

      <h3>Tiempo para alumnos (minutos)</h3>
      <input
        type="number"
        min="1"
        value={tiempo}
        onChange={(e) => setTiempo(Number(e.target.value))}
        style={{ width: "80px", padding: "5px" }}
      />

      <h3>Preguntas clínicas</h3>
      <p>Las respuestas de los alumnos serán de texto libre</p>

      {preguntas.map((pregunta, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder={`Pregunta ${index + 1}`}
            value={pregunta}
            onChange={(e) => actualizarPregunta(index, e.target.value)}
            style={{ width: "300px", margin: "5px", padding: "5px" }}
          />
        </div>
      ))}

      <button onClick={agregarPregunta}>
        + Agregar pregunta
      </button>

      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={guardarConfiguracion} disabled={guardando}>
        {guardando ? "Guardando..." : "🚀 Abrir sala"}
      </button>
    </div>
  );
}