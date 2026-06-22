import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Estadisticas from "./Estadisticas";

interface Props {
  profesorEmail: string;
  onVolver: () => void;
}

interface Sesion {
  id: string;
  codigo: string;
  activa: boolean;
  creada_en: string;
  tiempo_limite: number | null;
}

interface Alumno {
  id: string;
  nombre: string;
  email: string;
  joined_en: string;
  entregado: boolean;
}

interface Respuesta {
  id: string;
  respuesta: string;
  opcion_seleccionada: number | null;
  respondido_en: string;
  pregunta: {
    id: string;
    texto: string;
    orden: number;
    tipo: string;
    opciones?: string[];
  } | null;
}

export default function VerSesionesPrevias({ profesorEmail, onVolver }: Props) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [vistaEstadisticas, setVistaEstadisticas] = useState<Sesion | null>(null);

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    const { data, error } = await supabase
      .from("sesiones")
      .select("*")
      .eq("profesor_email", profesorEmail)
      .order("creada_en", { ascending: false });

    if (error) {
      console.error("Error al cargar sesiones:", error);
    } else if (data) {
      setSesiones(data as Sesion[]);
    }
    setCargando(false);
  };

  const verDetalleSesion = async (sesion: Sesion) => {
    setSesionSeleccionada(sesion);

    const { data: alumnosData } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", sesion.codigo);

    if (alumnosData) {
      setAlumnos(alumnosData as Alumno[]);
    }
  };

  const verRespuestasAlumno = async (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);

    const { data: respuestasData, error: errorRespuestas } = await supabase
      .from("respuestas_alumnos")
      .select("*")
      .eq("alumno_id", alumno.id);

    if (errorRespuestas) {
      console.error("Error al cargar respuestas:", errorRespuestas);
      setRespuestas([]);
      return;
    }

    if (respuestasData && respuestasData.length > 0) {
      const preguntaIds = [...new Set(respuestasData.map((r) => r.pregunta_id))];

      const { data: preguntasData } = await supabase
        .from("preguntas")
        .select("*")
        .in("id", preguntaIds);

      const preguntasMap = new Map();
      preguntasData?.forEach((p) => preguntasMap.set(p.id, p));

      const respuestasFormateadas: Respuesta[] = respuestasData.map((resp) => {
        const pregunta = preguntasMap.get(resp.pregunta_id);
        let respuestaMostrar = resp.respuesta;

        if (
          pregunta?.tipo === "multiple" &&
          resp.opcion_seleccionada !== null &&
          resp.opcion_seleccionada !== undefined
        ) {
          const opciones = pregunta.opciones as string[];
          if (opciones && opciones[resp.opcion_seleccionada]) {
            respuestaMostrar = opciones[resp.opcion_seleccionada];
          }
        }

        return {
          id: resp.id,
          respuesta: respuestaMostrar,
          opcion_seleccionada: resp.opcion_seleccionada,
          respondido_en: resp.respondido_en,
          pregunta: pregunta || {
            id: resp.pregunta_id,
            texto: "Pregunta no encontrada",
            orden: 0,
            tipo: "texto",
          },
        };
      });

      respuestasFormateadas.sort(
        (a, b) => (a.pregunta?.orden || 0) - (b.pregunta?.orden || 0)
      );

      setRespuestas(respuestasFormateadas);
    } else {
      setRespuestas([]);
    }
  };

  if (vistaEstadisticas) {
    return (
      <Estadisticas
        profesorEmail={profesorEmail}
        sesionInicial={vistaEstadisticas}
        onVolver={() => setVistaEstadisticas(null)}
      />
    );
  }

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-[#e8edf2] flex items-center justify-center">
        <div className="text-slate-500">Cargando sesiones...</div>
      </div>
    );
  }

  if (alumnoSeleccionado) {
    return (
      <div className="fixed inset-0 bg-[#e8edf2] overflow-y-auto">
        <div className="min-h-full w-full flex flex-col items-center pt-20 pb-8">
          <div className="w-full max-w-3xl px-4">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setAlumnoSeleccionado(null)}
                className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition text-slate-700"
              >
                ← Volver
              </button>
              <span className="text-sm text-slate-500">Alumno: {alumnoSeleccionado.nombre}</span>
            </div>

            <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-[#1e3a5f]">
                Respuestas de {alumnoSeleccionado.nombre}
              </h2>
              <p className="text-slate-500">{alumnoSeleccionado.email}</p>
              <p className="text-slate-500 text-sm">Sesion: {sesionSeleccionada?.codigo}</p>
              {alumnoSeleccionado.entregado ? (
                <p className="text-green-600 text-sm mt-2">Entregado</p>
              ) : (
                <p className="text-yellow-600 text-sm mt-2">Pendiente</p>
              )}
            </div>

            <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4">Respuestas</h3>

              {respuestas.length === 0 ? (
                <div>
                  <p className="text-red-500 mb-2">
                    No se encontraron respuestas para este alumno.
                  </p>
                  {alumnoSeleccionado.entregado && (
                    <p className="text-slate-500">
                      El alumno esta marcado como "Entregado" pero no hay respuestas en la base de
                      datos.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {respuestas.map((resp, idx) => (
                    <div key={resp.id} className="border-b pb-4">
                      <p className="font-medium text-[#1e3a5f] mb-2">
                        Pregunta {idx + 1}: {resp.pregunta?.texto || "Pregunta no encontrada"}
                      </p>
                      <p className="text-slate-700 bg-[#f0f8ff] p-3 rounded-lg">
                        {resp.respuesta || "Sin respuesta"}
                      </p>
                      {resp.pregunta?.tipo === "multiple" && resp.opcion_seleccionada !== null && (
                        <p className="text-xs text-slate-400 mt-1">
                          Opcion seleccionada: {resp.opcion_seleccionada + 1}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Respondido: {new Date(resp.respondido_en).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sesionSeleccionada) {
    const entregados = alumnos.filter((a) => a.entregado).length;

    return (
      <div className="fixed inset-0 bg-[#e8edf2] overflow-y-auto">
        <div className="min-h-full w-full flex flex-col items-center pt-60 pb-8">
          <div className="w-full max-w-3xl px-4">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setSesionSeleccionada(null)}
                className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition text-slate-700"
              >
                ← Volver a sesiones
              </button>
              <span className="text-sm text-slate-500">Sesion: {sesionSeleccionada.codigo}</span>
            </div>

            <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#1e3a5f]">
                    Sesion: {sesionSeleccionada.codigo}
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Creada:{" "}
                    {new Date(sesionSeleccionada.creada_en).toLocaleString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-slate-500 text-sm">
                    Tiempo limite:{" "}
                    {sesionSeleccionada.tiempo_limite
                      ? `${Math.floor(sesionSeleccionada.tiempo_limite / 60)} minutos`
                      : "No definido"}
                  </p>
                </div>
                {sesionSeleccionada.activa ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium shrink-0">
                    Activa
                  </span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium shrink-0">
                    Finalizada
                  </span>
                )}
              </div>

              {alumnos.length > 0 && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1e3a5f]">{alumnos.length}</p>
                    <p className="text-xs text-slate-400">Alumnos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{entregados}</p>
                    <p className="text-xs text-slate-400">Entregaron</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">{alumnos.length - entregados}</p>
                    <p className="text-xs text-slate-400">Pendientes</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setVistaEstadisticas(sesionSeleccionada)}
              className="w-full mb-4 py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver estadisticas de esta sesion
            </button>

            <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4">
                Alumnos ({alumnos.length})
              </h3>

              {alumnos.length === 0 ? (
                <p className="text-slate-500">No hay alumnos en esta sesion.</p>
              ) : (
                <div className="space-y-2">
                  {alumnos.map((alumno) => (
                    <div
                      key={alumno.id}
                      onClick={() => verRespuestasAlumno(alumno)}
                      className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-[#f0f8ff] transition"
                    >
                      <div>
                        <p className="font-medium text-[#1e3a5f]">{alumno.nombre}</p>
                        <p className="text-sm text-slate-500">{alumno.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {alumno.entregado === true ? (
                          <span className="text-green-600 font-medium text-sm">Entregado</span>
                        ) : (
                          <span className="text-yellow-600 font-medium text-sm">Pendiente</span>
                        )}
                        <span className="text-slate-400">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="fixed inset-0 bg-[#e8edf2] overflow-y-auto">
    <div className="min-h-full w-full flex flex-col items-center pt-40 pb-8">
      <div className="w-full max-w-3xl px-4">
        <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-[#1e3a5f]">Mis sesiones</h2>
          <button
            onClick={onVolver}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition text-slate-700 font-medium"
          >
            ← Volver al panel
          </button>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          {sesiones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No has creado ninguna sesion todavia.</p>
              <button
                onClick={onVolver}
                className="mt-4 px-4 py-2 bg-[#9ecbff] rounded-lg hover:bg-[#81b0d6] transition text-slate-700 font-medium"
              >
                Crear mi primera sesion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sesiones.map((sesion) => (
                <div
                  key={sesion.id}
                  onClick={() => verDetalleSesion(sesion)}
                  className="bg-white/50 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition border border-slate-200/50 hover:border-[#9ecbff]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-[#1e3a5f]">{sesion.codigo}</p>
                      <p className="text-sm text-slate-500">
                        Creada:{" "}
                        {new Date(sesion.creada_en).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sesion.activa ? (
                        <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                          Activa
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">
                          Finalizada
                        </span>
                      )}
                      <span className="text-slate-400 text-xl">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}