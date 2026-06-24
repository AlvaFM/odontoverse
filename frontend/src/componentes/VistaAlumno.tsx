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
  opciones: string[];
  respuesta_correcta: number | null;
}

interface Sesion {
  activa: boolean;
  activada_en: string | null;
  tiempo_limite: number | null;
  finalizada_en: string | null;
  imagen_url: string | null;
  mostrar_imagen: boolean;
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
  const [resultados, setResultados] = useState<{ correctas: number; total: number; detalles: { preguntaId: string; correcta: boolean; opcionSeleccionada: string }[] } | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [mostrarImagen, setMostrarImagen] = useState<boolean>(false);
  
  const intervalRef = useRef<number | null>(null);
  const respuestasEnviadasRef = useRef<boolean>(false);
  const ultimoEstadoRef = useRef<string>("");

  const todasRespondidas = (): boolean => {
    for (const pregunta of preguntas) {
      const respuesta = respuestas[pregunta.id];
      if (!respuesta || respuesta.trim() === "") {
        return false;
      }
    }
    return true;
  };

  const calcularTiempoRestante = (sesion: Sesion): number => {
    if (sesion.finalizada_en !== null) {
      return 0;
    }
    if (!sesion.activa) {
      return 0;
    }
    if (!sesion.activada_en || !sesion.tiempo_limite) {
      return 0;
    }
    
    const activadaEn = new Date(sesion.activada_en).getTime();
    const ahora = Date.now();
    const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
    const restante = Math.max(0, sesion.tiempo_limite - segundosTranscurridos);
    
    return restante;
  };

  const cargarPreguntas = async () => {
    const { data: preguntasData, error: preguntasError } = await supabase
      .from("preguntas")
      .select("*")
      .eq("sesion_codigo", codigoSesion)
      .order("orden", { ascending: true });

    if (preguntasError) {
      console.error("Error al cargar preguntas:", preguntasError);
      return;
    }

    if (preguntasData && preguntasData.length > 0) {
      setPreguntas(preguntasData as Pregunta[]);
    } else {
      setTiempoFinalizado(true);
    }
  };

  const obtenerSesion = async (): Promise<Sesion | null> => {
    const { data, error } = await supabase
      .from("sesiones")
      .select("activa, activada_en, tiempo_limite, finalizada_en, imagen_url, mostrar_imagen")
      .eq("codigo", codigoSesion)
      .maybeSingle();

    if (error) {
      console.error("Error al obtener sesion:", error);
      return null;
    }

    return data as Sesion | null;
  };

  const actualizarEstado = async () => {
    const sesion = await obtenerSesion();
    if (!sesion) {
      setTiempoFinalizado(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Actualizar imagen si está disponible
    if (sesion.mostrar_imagen && sesion.imagen_url) {
      setImagenUrl(sesion.imagen_url);
      setMostrarImagen(true);
    } else {
      setImagenUrl(null);
      setMostrarImagen(false);
    }

    const estadoActual = `${sesion.activa}_${sesion.activada_en}_${sesion.tiempo_limite}_${sesion.finalizada_en}`;
    
    if (estadoActual !== ultimoEstadoRef.current) {
      ultimoEstadoRef.current = estadoActual;
      
      if (sesion.finalizada_en !== null || !sesion.activa) {
        setTiempoFinalizado(true);
        if (!respuestasEnviadasRef.current) {
          await guardarRespuestasEnBD();
          await calcularResultados();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      if (sesion.activa) {
        setTiempoFinalizado(false);
        setRespuestas({});
        setRespuestasOpcion({});
        setIndicePregunta(0);
        setEnviado(false);
        respuestasEnviadasRef.current = false;
        await cargarPreguntas();
      }
    }

    if (sesion.activa && sesion.finalizada_en === null) {
      const restante = calcularTiempoRestante(sesion);
      setTiempoRestante(restante);

      if (restante <= 0 && !respuestasEnviadasRef.current) {
        setTiempoFinalizado(true);
        await guardarRespuestasEnBD();
        await calcularResultados();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      await actualizarEstado();
      setCargando(false);
    };

    inicializar();

    intervalRef.current = window.setInterval(async () => {
      if (!isMounted) return;
      await actualizarEstado();
    }, 1000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const calcularResultados = async () => {
    const preguntasConOpciones = preguntas.filter(p => p.tipo === "multiple" && p.respuesta_correcta !== null);
    let correctas = 0;
    const detalles: { preguntaId: string; correcta: boolean; opcionSeleccionada: string }[] = [];

    for (const pregunta of preguntasConOpciones) {
      const opcionSeleccionada = respuestasOpcion[pregunta.id];
      const esCorrecta = opcionSeleccionada !== undefined && opcionSeleccionada === pregunta.respuesta_correcta;
      
      if (esCorrecta) correctas++;
      detalles.push({
        preguntaId: pregunta.id,
        correcta: esCorrecta,
        opcionSeleccionada: opcionSeleccionada !== undefined ? pregunta.opciones[opcionSeleccionada] : "No respondida"
      });
    }

    setResultados({
      correctas,
      total: preguntasConOpciones.length,
      detalles
    });

    await supabase
      .from("alumnos")
      .update({ 
        puntaje: correctas,
        total_preguntas: preguntasConOpciones.length
      })
      .eq("id", alumnoId);
  };

  const guardarRespuestasEnBD = async () => {
    if (enviado || respuestasEnviadasRef.current) return;
    
    respuestasEnviadasRef.current = true;
    setEnviando(true);
    setError("");

    for (const [preguntaId, respuestaTexto] of Object.entries(respuestas)) {
      if (respuestaTexto && respuestaTexto.trim()) {
        const esCorrecta = false;
        
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
            es_correcta: esCorrecta,
            respondido_en: new Date().toISOString(),
          }]);

          if (error) {
            console.error("Error al guardar respuesta:", error);
            setError("Error al guardar algunas respuestas");
          }
        } else {
          const { error } = await supabase
            .from("respuestas_alumnos")
            .update({
              respuesta: respuestaTexto,
              es_correcta: false,
              respondido_en: new Date().toISOString()
            })
            .eq("id", existe.id);

          if (error) {
            console.error("Error al actualizar respuesta:", error);
            setError("Error al actualizar algunas respuestas");
          }
        }
      }
    }

    for (const [preguntaId, opcionIndex] of Object.entries(respuestasOpcion)) {
      const pregunta = preguntas.find(p => p.id === preguntaId);
      const opcionTexto = pregunta?.opciones?.[opcionIndex] || "";
      
      const esCorrecta = pregunta?.respuesta_correcta !== null && 
                         pregunta?.respuesta_correcta === opcionIndex;
      
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
          respuesta: opcionTexto,
          opcion_seleccionada: opcionIndex,
          es_correcta: esCorrecta,
          respondido_en: new Date().toISOString(),
        }]);

        if (error) {
          console.error("Error al guardar respuesta multiple:", error);
          setError("Error al guardar algunas respuestas");
        }
      } else {
        const { error } = await supabase
          .from("respuestas_alumnos")
          .update({
            respuesta: opcionTexto,
            opcion_seleccionada: opcionIndex,
            es_correcta: esCorrecta,
            respondido_en: new Date().toISOString()
          })
          .eq("id", existe.id);

        if (error) {
          console.error("Error al actualizar respuesta multiple:", error);
          setError("Error al actualizar algunas respuestas");
        }
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

  const guardarRespuestaMultiple = (preguntaId: string, opcionIndex: number, opcionTexto: string) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: opcionTexto,
    });
    setRespuestasOpcion({
      ...respuestasOpcion,
      [preguntaId]: opcionIndex,
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
      return;
    }
    
    await guardarRespuestasEnBD();
    await calcularResultados();
    setTiempoFinalizado(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatearTiempo = (segundos: number) => {
    if (segundos < 0) return "00:00";
    const mins = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
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
        <div className="text-center bg-white rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-4">
            {enviado ? "Respuestas enviadas" : "Tiempo finalizado"}
          </h2>
          
          {resultados && resultados.total > 0 && (
            <div className="mb-6">
              <div className="bg-[#f0f8ff] rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-500">Tu puntaje</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">
                  {resultados.correctas} / {resultados.total}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {Math.round((resultados.correctas / resultados.total) * 100)}% correctas
                </p>
              </div>
              
              <div className="space-y-2 text-left">
                <p className="text-sm font-medium text-[#1e3a5f]">Resumen de respuestas:</p>
                {preguntas.filter(p => p.tipo === "multiple").map((pregunta, idx) => {
                  const detalle = resultados.detalles.find(d => d.preguntaId === pregunta.id);
                  return (
                    <div key={pregunta.id} className="text-sm border-b border-[#cfeaf6] py-2">
                      <p className="text-slate-700">{idx + 1}. {pregunta.texto}</p>
                      <p className="text-slate-500 ml-4">Tu respuesta: {detalle?.opcionSeleccionada || "No respondida"}</p>
                      {detalle && (
                        <p className={`ml-4 font-medium ${detalle.correcta ? 'text-green-600' : 'text-red-500'}`}>
                          {detalle.correcta ? 'Correcta' : 'Incorrecta'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-slate-600 mb-2">Gracias por participar, {nombre}.</p>
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
          <h2 className="text-xl font-semibold text-red-500 mb-4">No hay preguntas</h2>
          <p className="text-slate-600 mb-4">El profesor aun no ha configurado las preguntas para esta sesion.</p>
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
        <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">Alumno: {nombre}</h2>
        <p className="text-slate-500 mb-1"><strong>Sesion:</strong> {codigoSesion}</p>
        <p className="text-slate-500 mb-6"><strong>Email:</strong> {email}</p>

        <div className="bg-[#f0f8ff] rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">
            {tiempoRestante !== null ? formatearTiempo(tiempoRestante) : "Calculando..."}
          </p>
        </div>

        {/* Mostrar imagen del caso clínico si está disponible */}
        {mostrarImagen && imagenUrl && (
          <div className="mb-6 bg-[#f0f8ff] rounded-xl p-4 text-center">
            <p className="text-sm text-slate-500 mb-2">Caso clínico</p>
            <img 
              src={imagenUrl} 
              alt="Caso clínico" 
              className="max-h-64 mx-auto rounded-lg object-contain border border-[#cfeaf6]"
            />
          </div>
        )}

        <hr className="my-4" />

        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
          Pregunta {indicePregunta + 1} de {preguntas.length}
        </h3>
        <p className="text-slate-700 text-lg mb-4">{preguntaActual.texto}</p>

        {preguntaActual.tipo === "multiple" ? (
          <div className="space-y-3 mb-4">
            {preguntaActual.opciones.map((opcion, optIdx) => (
              <label key={optIdx} className="flex items-center gap-3 p-3 border border-[#cfeaf6] rounded-xl cursor-pointer hover:bg-[#f0f8ff] transition">
                <input
                  type="radio"
                  name={`pregunta_${preguntaActual.id}`}
                  value={opcion}
                  checked={respuestas[preguntaActual.id] === opcion}
                  onChange={() => guardarRespuestaMultiple(preguntaActual.id, optIdx, opcion)}
                  className="w-4 h-4 text-[#9ecbff] focus:ring-[#9ecbff]"
                />
                <span className="text-slate-700">{opcion}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            rows={6}
            placeholder="Escribe tu respuesta aqui..."
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
            Siguiente pregunta
          </button>
        ) : (
          <button 
            onClick={enviarRespuestas} 
            disabled={enviando}
            className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 font-medium"
          >
            {enviando ? "Enviando..." : "Enviar respuestas"}
          </button>
        )}
      </div>
    </div>
  );
}