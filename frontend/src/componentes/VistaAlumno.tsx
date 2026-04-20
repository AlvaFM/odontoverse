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
  activa: boolean;
  activada_en: string | null;
  tiempo_limite: number | null;
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
        .select("activa, activada_en, tiempo_limite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      if (error) {
        console.error("Error al cargar sesión:", error);
        setTiempoFinalizado(true);
        setCargando(false);
        return;
      }

      const sesion = data as Sesion | null;

      if (!sesion || sesion.activa !== true) {
        setTiempoFinalizado(true);
        setCargando(false);
        return;
      }

      if (sesion.activada_en && sesion.tiempo_limite) {
        const activadaEn = new Date(sesion.activada_en).getTime();
        const ahora = new Date().getTime();
        const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
        const restante = Math.max(0, sesion.tiempo_limite - segundosTranscurridos);
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
        .select("activa, activada_en, tiempo_limite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      if (error) {
        console.error("Error en polling:", error);
        return;
      }

      const sesion = data as Sesion | null;

      if (!sesion || sesion.activa !== true) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setTiempoFinalizado(true);
        guardarRespuestasEnBD();
        return;
      }

      if (sesion.activada_en && sesion.tiempo_limite) {
        const activadaEn = new Date(sesion.activada_en).getTime();
        const ahora = new Date().getTime();
        const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
        const restante = Math.max(0, sesion.tiempo_limite - segundosTranscurridos);
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

    console.log("Guardando respuestas para alumno:", alumnoId);
    console.log("Respuestas a guardar:", respuestas);

    for (const [preguntaId, respuestaTexto] of Object.entries(respuestas)) {
      if (respuestaTexto && respuestaTexto.trim()) {
        const { data, error } = await supabase.from("respuestas_alumnos").insert([{
          alumno_id: alumnoId,
          pregunta_id: preguntaId,
          respuesta: respuestaTexto,
          respondido_en: new Date().toISOString(),
        }]).select();

        if (error) {
          console.error("Error al guardar respuesta:", error);
        } else {
          console.log("Respuesta guardada:", data);
        }
      }
    }

    // Marcar que el alumno entregó (podemos agregar un campo 'entregado' en la tabla alumnos)
    const { error: updateError } = await supabase
      .from("alumnos")
      .update({ entregado: true })
      .eq("id", alumnoId);

    if (updateError) {
      console.error("Error al marcar como entregado:", updateError);
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9ecbff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (tiempoFinalizado || enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-4">⏰ Tiempo finalizado</h2>
          <p className="text-slate-600 mb-2">Gracias por participar, {nombre}.</p>
          <p className="text-slate-600 mb-2">Tus respuestas han sido enviadas al profesor.</p>
          <p className="text-slate-600 mb-6">Los resultados te llegarán a: <strong>{email}</strong></p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#9ecbff] rounded-xl hover:bg-[#81b0d6] transition">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
        <div className="text-center bg-white rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-500 mb-4">⚠️ No hay preguntas</h2>
          <p className="text-slate-600 mb-4">El profesor aún no ha configurado las preguntas para esta sesión.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#9ecbff] rounded-xl">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[indicePregunta];
  const esUltima = indicePregunta === preguntas.length - 1;

  return (
    <div className="min-h-screen bg-[#f7fbfd] p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">🧑‍🎓 Alumno: {nombre}</h2>
        <p className="text-slate-500 mb-1"><strong>Sesión:</strong> {codigoSesion}</p>
        <p className="text-slate-500 mb-6"><strong>Email:</strong> {email}</p>

        <div className="bg-[#f0f8ff] rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">{tiempoRestante !== null ? formatearTiempo(tiempoRestante) : "Calculando..."}</p>
        </div>

        <hr className="my-4" />

        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">Pregunta {indicePregunta + 1} de {preguntas.length}</h3>
        <p className="text-slate-700 text-lg mb-4">{preguntaActual.texto}</p>

        <textarea
          rows={6}
          placeholder="Escribe tu respuesta aquí..."
          value={respuestas[preguntaActual.id] || ""}
          onChange={(e) => guardarRespuesta(e.target.value)}
          className="w-full p-3 border border-[#cfeaf6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9ecbff] mb-4"
        />

        {!esUltima ? (
          <button onClick={siguientePregunta} className="w-full py-3 bg-[#9ecbff] text-[#1e3a5f] rounded-xl hover:bg-[#81b0d6] transition">
            Siguiente pregunta →
          </button>
        ) : (
          <button onClick={enviarRespuestas} disabled={enviando} className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50">
            {enviando ? "Enviando..." : "📤 Enviar respuestas"}
          </button>
        )}
      </div>
    </div>
  );
}