import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  nombre: string;
  email: string;
  codigoSesion: string;
  alumnoId: string;
}

interface Pregunta {
  id: string;
  texto: string;
  orden: number;
}

export default function VistaAlumno({
  nombre,
  email,
  codigoSesion,
  alumnoId,
}: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: string]: string }>({});
  const [tiempo, setTiempo] = useState<number | null>(null);
  const [tiempoFinalizado, setTiempoFinalizado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar preguntas y tiempo de la sesión
  useEffect(() => {
    const cargarDatosSesion = async () => {
      // Obtener tiempo límite de la sesión
      const { data: sesion } = await supabase
        .from("sesiones")
        .select("tiempo_limite")
        .eq("codigo", codigoSesion)
        .single();

      if (sesion?.tiempo_limite) {
        setTiempo(sesion.tiempo_limite);
      }

      // Obtener preguntas
      const { data: preguntasData } = await supabase
        .from("preguntas")
        .select("*")
        .eq("sesion_codigo", codigoSesion)
        .order("orden", { ascending: true });

      if (preguntasData) {
        setPreguntas(preguntasData);
      }

      setCargando(false);
    };

    cargarDatosSesion();
  }, [codigoSesion]);

  // Timer
  useEffect(() => {
    if (tiempo === null || tiempo <= 0) return;

    if (tiempo <= 0) {
      setTiempoFinalizado(true);
      enviarRespuestasAutomaticamente();
      return;
    }

    const intervalo = setInterval(() => {
      setTiempo((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempo]);

  const enviarRespuestasAutomaticamente = async () => {
    if (enviado) return;
    await guardarRespuestasEnBD();
  };

  const guardarRespuestasEnBD = async () => {
    setEnviando(true);

    for (const [preguntaId, respuestaTexto] of Object.entries(respuestas)) {
      if (respuestaTexto.trim()) {
        await supabase.from("respuestas_alumnos").insert([{
          alumno_id: alumnoId,
          pregunta_id: preguntaId,
          respuesta: respuestaTexto,
          respondido_en: new Date().toISOString(),
        }]);
      }
    }

    setEnviado(true);
    setEnviando(false);
  };

  const guardarRespuesta = (valor: string) => {
    const preguntaActual = preguntas[indicePregunta];
    setRespuestas({
      ...respuestas,
      [preguntaActual.id]: valor,
    });
  };

  const siguientePregunta = () => {
    if (indicePregunta < preguntas.length - 1) {
      setIndicePregunta(indicePregunta + 1);
    }
  };

  const enviarRespuestas = async () => {
    await guardarRespuestasEnBD();
    setTiempoFinalizado(true);
  };

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, "0")}`;
  };

  if (cargando) {
    return <div>Cargando preguntas...</div>;
  }

  if (tiempoFinalizado || enviado) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⏰ Tiempo finalizado</h2>
        <p>Gracias por participar, {nombre}.</p>
        <p>Tus respuestas han sido enviadas al profesor.</p>
        <p>Los resultados te llegarán a: <strong>{email}</strong></p>
        <hr />
        <button onClick={() => window.location.reload()}>
          Volver al inicio
        </button>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return <div>No hay preguntas configuradas para esta sesión.</div>;
  }

  const preguntaActual = preguntas[indicePregunta];
  const esUltima = indicePregunta === preguntas.length - 1;

  return (
    <div>
      <h2>🧑‍🎓 Alumno: {nombre}</h2>
      <p><strong>Sesión:</strong> {codigoSesion}</p>
      <p><strong>Email para resultados:</strong> {email}</p>

      <div style={{ 
        backgroundColor: "#f0f0f0", 
        padding: "10px", 
        borderRadius: "8px",
        textAlign: "center",
        fontSize: "24px",
        fontWeight: "bold"
      }}>
        ⏱️ Tiempo restante: {formatearTiempo(tiempo || 0)}
      </div>

      <hr />

      <h3>Pregunta {indicePregunta + 1} de {preguntas.length}</h3>
      <p style={{ fontSize: "18px", margin: "20px 0" }}>{preguntaActual.texto}</p>

      <textarea
        rows={6}
        cols={60}
        placeholder="Escribe tu respuesta aquí..."
        value={respuestas[preguntaActual.id] || ""}
        onChange={(e) => guardarRespuesta(e.target.value)}
        style={{ width: "100%", maxWidth: "500px", padding: "10px" }}
      />

      <br /><br />

      {!esUltima ? (
        <button onClick={siguientePregunta}>
          Siguiente pregunta →
        </button>
      ) : (
        <button onClick={enviarRespuestas} disabled={enviando}>
          {enviando ? "Enviando..." : "📤 Enviar respuestas"}
        </button>
      )}
    </div>
  );
}