import { useEffect, useState, useRef } from "react";
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

interface Sesion {
  estado: string;
  activada_en: string | null;
  tiempo_límite: number | null;
}

export default function VistaAlumno({ nombre, email, codigoSesion, alumnoId }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indicePregunta, setIndicePregunta] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: string]: string }>({});
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [tiempoFinalizado, setTiempoFinalizado] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    const cargarDatosSesion = async () => {
      const { data, error } = await supabase
        .from("sesiones")
        .select("estado, activada_en, tiempo_límite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      if (error) {
        console.error("Error al cargar sesión:", error);
        setTiempoFinalizado(true);
        setCargando(false);
        return;
      }

      const sesion = data as Sesion | null;

      if (!sesion || sesion.estado !== "activa") {
        setTiempoFinalizado(true);
        setCargando(false);
        return;
      }

      if (sesion.activada_en && sesion.tiempo_límite) {
        const activadaEn = new Date(sesion.activada_en).getTime();
        const ahora = new Date().getTime();
        const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
        const restante = Math.max(0, sesion.tiempo_límite - segundosTranscurridos);
        setTiempoRestante(restante);

        if (restante <= 0) {
          setTiempoFinalizado(true);
          guardarRespuestasEnBD();
          setCargando(false);
          return;
        }
      }

      const { data: preguntasData, error: errorPreguntas } = await supabase
        .from("preguntas")
        .select("*")
        .eq("sesion_codigo", codigoSesion)
        .order("orden", { ascending: true });

      if (errorPreguntas) {
        console.error("Error al cargar preguntas:", errorPreguntas);
      }

      if (preguntasData && preguntasData.length > 0) {
        setPreguntas(preguntasData as Pregunta[]);
      } else {
        setTiempoFinalizado(true);
      }

      setCargando(false);
    };

    cargarDatosSesion();

    pollingRef.current = window.setInterval(async () => {
      const { data, error } = await supabase
        .from("sesiones")
        .select("estado, activada_en, tiempo_límite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      if (error) {
        console.error("Error en polling:", error);
        return;
      }

      const sesion = data as Sesion | null;

      if (!sesion || sesion.estado !== "activa") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setTiempoFinalizado(true);
        guardarRespuestasEnBD();
        return;
      }

      if (sesion.activada_en && sesion.tiempo_límite) {
        const activadaEn = new Date(sesion.activada_en).getTime();
        const ahora = new Date().getTime();
        const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
        const restante = Math.max(0, sesion.tiempo_límite - segundosTranscurridos);
        setTiempoRestante(restante);

        if (restante <= 0 && !tiempoFinalizado) {
          setTiempoFinalizado(true);
          guardarRespuestasEnBD();
        }
      }
    }, 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [codigoSesion]);

  const guardarRespuestasEnBD = async () => {
    if (enviado) return;
    
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
    if (preguntas.length === 0) return;
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
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, "0")}`;
  };

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Cargando cuestionario...</h2>
        <div className="spinner" style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "20px auto"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⚠️ No hay preguntas</h2>
        <p>El profesor aún no ha configurado las preguntas para esta sesión.</p>
        <button onClick={() => window.location.reload()}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const preguntaActual = preguntas[indicePregunta];
  const esUltima = indicePregunta === preguntas.length - 1;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🧑‍🎓 Alumno: {nombre}</h2>
      <p><strong>Sesión:</strong> {codigoSesion}</p>
      <p><strong>Email para resultados:</strong> {email}</p>

      <div style={{ 
        backgroundColor: "#e8f5e9", 
        padding: "10px", 
        borderRadius: "8px",
        textAlign: "center",
        fontSize: "28px",
        fontWeight: "bold"
      }}>
        ⏱️ Tiempo restante: {tiempoRestante !== null ? formatearTiempo(tiempoRestante) : "Calculando..."}
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
        style={{ width: "100%", maxWidth: "600px", padding: "10px", fontSize: "14px" }}
      />

      <br /><br />

      {!esUltima ? (
        <button onClick={siguientePregunta} style={{ padding: "10px 20px" }}>
          Siguiente pregunta →
        </button>
      ) : (
        <button 
          onClick={enviarRespuestas} 
          disabled={enviando}
          style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white" }}
        >
          {enviando ? "Enviando..." : "📤 Enviar respuestas"}
        </button>
      )}
    </div>
  );
}