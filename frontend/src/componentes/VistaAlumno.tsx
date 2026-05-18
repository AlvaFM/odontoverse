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
  tipo: "texto" | "multiple";
  opciones?: string[];
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
  const [respuestasOpcion, setRespuestasOpcion] = useState<{ [preguntaId: string]: number }>({});
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [tiempoFinalizado, setTiempoFinalizado] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const pollingRef = useRef<number | null>(null);
  const respuestasEnviadasRef = useRef<boolean>(false);

  // Verificar si todas las preguntas están respondidas
  const todasRespondidas = (): boolean => {
    for (const pregunta of preguntas) {
      const respuesta = respuestas[pregunta.id];
      if (!respuesta || respuesta.trim() === "") {
        return false;
      }
    }
    return true;
  };

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
        if (!respuestasEnviadasRef.current) {
          setTiempoFinalizado(true);
          guardarRespuestasEnBD();
        }
        return;
      }

      if (sesion.activada_en && sesion.tiempo_limite) {
        const activadaEn = new Date(sesion.activada_en).getTime();
        const ahora = new Date().getTime();
        const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
        const restante = Math.max(0, sesion.tiempo_limite - segundosTranscurridos);
        setTiempoRestante(restante);

        if (restante <= 0 && !tiempoFinalizado && !respuestasEnviadasRef.current) {
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
    // Evitar envíos duplicados
    if (enviado || respuestasEnviadasRef.current) return;
    
    respuestasEnviadasRef.current = true;
    setEnviando(true);
    setError("");

    console.log("Guardando respuestas para alumno:", alumnoId);
    console.log("Respuestas texto:", respuestas);
    console.log("Respuestas opciones:", respuestasOpcion);

    // Guardar respuestas de texto
    for (const [preguntaId, respuestaTexto] of Object.entries(respuestas)) {
      if (respuestaTexto && respuestaTexto.trim()) {
        // Verificar si ya existe respuesta para esta pregunta
        const { data: existe } = await supabase
          .from("respuestas_alumnos")
          .select("id")
          .eq("alumno_id", alumnoId)
          .eq("pregunta_id", preguntaId)
          .maybeSingle();

        if (!existe) {
          const { error } = await supabase.from("respuestas_alumnos").insert([{
            alumno_id: alumnoId,
            pregunta_id: preguntaId,
            respuesta: respuestaTexto,
            respondido_en: new Date().toISOString(),
          }]);

          if (error) {
            console.error("Error al guardar respuesta:", error);
            setError("Error al guardar algunas respuestas");
          } else {
            console.log("Respuesta guardada:", preguntaId);
          }
        } else {
          console.log("Respuesta ya existe, omitiendo:", preguntaId);
        }
      }
    }

    // Guardar respuestas de opción múltiple
    for (const [preguntaId, opcionIndex] of Object.entries(respuestasOpcion)) {
      // Verificar si ya existe respuesta para esta pregunta
      const { data: existe } = await supabase
        .from("respuestas_alumnos")
        .select("id")
        .eq("alumno_id", alumnoId)
        .eq("pregunta_id", preguntaId)
        .maybeSingle();

      if (!existe) {
        const pregunta = preguntas.find(p => p.id === preguntaId);
        const opcionTexto = pregunta?.opciones?.[opcionIndex] || "";
        
        const { error } = await supabase.from("respuestas_alumnos").insert([{
          alumno_id: alumnoId,
          pregunta_id: preguntaId,
          respuesta: opcionTexto,
          opcion_seleccionada: opcionIndex,
          respondido_en: new Date().toISOString(),
        }]);

        if (error) {
          console.error("Error al guardar respuesta múltiple:", error);
          setError("Error al guardar algunas respuestas");
        } else {
          console.log("Respuesta múltiple guardada:", preguntaId);
        }
      } else {
        console.log("Respuesta múltiple ya existe, omitiendo:", preguntaId);
      }
    }

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

  const guardarRespuestaTexto = (valor: string) => {
    if (preguntas.length === 0) return;
    const preguntaActual = preguntas[indicePregunta];
    setRespuestas({
      ...respuestas,
      [preguntaActual.id]: valor,
    });
    if (error) setError("");
  };

  const guardarRespuestaMultiple = (opcionIndex: number, opcionTexto: string) => {
    if (preguntas.length === 0) return;
    const preguntaActual = preguntas[indicePregunta];
    setRespuestas({
      ...respuestas,
      [preguntaActual.id]: opcionTexto,
    });
    setRespuestasOpcion({
      ...respuestasOpcion,
      [preguntaActual.id]: opcionIndex,
    });
    if (error) setError("");
  };

  const siguientePregunta = () => {
    const preguntaActual = preguntas[indicePregunta];
    const respuestaActual = respuestas[preguntaActual.id];
    
    if (!respuestaActual || respuestaActual.trim() === "") {
      setError("Por favor responde esta pregunta antes de continuar");
      return;
    }
    
    setError("");
    if (indicePregunta < preguntas.length - 1) {
      setIndicePregunta(indicePregunta + 1);
    }
  };

  const enviarRespuestas = async () => {
    if (!todasRespondidas()) {
      setError("Por favor responde todas las preguntas antes de enviar");
      return;
    }
    
    if (enviado || respuestasEnviadasRef.current) {
      console.log("Respuestas ya enviadas, ignorando");
      return;
    }
    
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

        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
          Pregunta {indicePregunta + 1} de {preguntas.length}
        </h3>
        <p className="text-slate-700 text-lg mb-4">{preguntaActual.texto}</p>

        {preguntaActual.tipo === "multiple" ? (
          <div className="space-y-3 mb-4">
            {preguntaActual.opciones?.map((opcion, optIdx) => (
              <label key={optIdx} className="flex items-center gap-3 p-3 border border-[#cfeaf6] rounded-xl cursor-pointer hover:bg-[#f0f8ff] transition">
                <input
                  type="radio"
                  name={`pregunta_${preguntaActual.id}`}
                  value={opcion}
                  checked={respuestas[preguntaActual.id] === opcion}
                  onChange={() => guardarRespuestaMultiple(optIdx, opcion)}
                  className="w-4 h-4 text-[#9ecbff] focus:ring-[#9ecbff]"
                />
                <span className="text-slate-700">{opcion}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            rows={6}
            placeholder="Escribe tu respuesta aquí..."
            value={respuestas[preguntaActual.id] || ""}
            onChange={(e) => guardarRespuestaTexto(e.target.value)}
            className="w-full p-3 border border-[#cfeaf6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9ecbff] mb-4"
          />
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {!esUltima ? (
          <button onClick={siguientePregunta} className="w-full py-3 bg-[#9ecbff] text-[#1e3a5f] rounded-xl hover:bg-[#81b0d6] transition font-medium">
            Siguiente pregunta →
          </button>
        ) : (
          <button 
            onClick={enviarRespuestas} 
            disabled={enviando}
            className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 font-medium"
          >
            {enviando ? "Enviando..." : "📤 Enviar respuestas"}
          </button>
        )}
      </div>
    </div>
  );
}