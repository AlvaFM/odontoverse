import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  respondido_en: string;
  pregunta: {
    id: string;
    texto: string;
    orden: number;
  } | null;
}

export default function VerSesionesPrevias({ profesorEmail, onVolver }: Props) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);

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
      console.log("Alumnos cargados:", alumnosData.map(a => ({ nombre: a.nombre, entregado: a.entregado })));
    }
  };

  const verRespuestasAlumno = async (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    
    console.log("Buscando respuestas para alumno:", alumno.id);
    
    // Obtener respuestas del alumno sin usar nested select
    const { data: respuestasData, error: errorRespuestas } = await supabase
      .from("respuestas_alumnos")
      .select("*")
      .eq("alumno_id", alumno.id);

    if (errorRespuestas) {
      console.error("Error al cargar respuestas:", errorRespuestas);
      setRespuestas([]);
      return;
    }

    console.log("Respuestas encontradas:", respuestasData);

    if (respuestasData && respuestasData.length > 0) {
      // Obtener todas las preguntas de una vez
      const preguntaIds = [...new Set(respuestasData.map(r => r.pregunta_id))];
      
      const { data: preguntasData } = await supabase
        .from("preguntas")
        .select("*")
        .in("id", preguntaIds);

      const preguntasMap = new Map();
      preguntasData?.forEach(p => preguntasMap.set(p.id, p));

      // Formatear respuestas con sus preguntas
      const respuestasFormateadas: Respuesta[] = respuestasData.map(resp => ({
        id: resp.id,
        respuesta: resp.respuesta,
        respondido_en: resp.respondido_en,
        pregunta: preguntasMap.get(resp.pregunta_id) || {
          id: resp.pregunta_id,
          texto: "Pregunta no encontrada",
          orden: 0
        }
      }));

      // Ordenar por orden de pregunta
      respuestasFormateadas.sort((a, b) => {
        return (a.pregunta?.orden || 0) - (b.pregunta?.orden || 0);
      });

      setRespuestas(respuestasFormateadas);
    } else {
      setRespuestas([]);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Cargando sesiones...</div>
      </div>
    );
  }

  // Vista de respuestas de un alumno
  if (alumnoSeleccionado) {
    return (
      <div className="min-h-screen bg-[#f7fbfd] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setAlumnoSeleccionado(null)}
              className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
            >
              ← Volver a alumnos
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-[#1e3a5f]">Respuestas de {alumnoSeleccionado.nombre}</h2>
            <p className="text-slate-500">{alumnoSeleccionado.email}</p>
            <p className="text-slate-500 text-sm">Sesión: {sesionSeleccionada?.codigo}</p>
            {alumnoSeleccionado.entregado ? (
              <p className="text-green-600 text-sm mt-2">✅ Entregado</p>
            ) : (
              <p className="text-yellow-600 text-sm mt-2">⏳ Pendiente</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1e3a5f] mb-4">Respuestas</h3>
            
            {respuestas.length === 0 ? (
              <div>
                <p className="text-red-500 mb-2">⚠️ No se encontraron respuestas para este alumno.</p>
                {alumnoSeleccionado.entregado && (
                  <p className="text-slate-500">El alumno está marcado como "Entregado" pero no hay respuestas en la base de datos. Verifica la tabla respuestas_alumnos.</p>
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
    );
  }

  // Vista de alumnos de una sesión
  if (sesionSeleccionada) {
    return (
      <div className="min-h-screen bg-[#f7fbfd] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSesionSeleccionada(null)}
              className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
            >
              ← Volver a sesiones
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-[#1e3a5f]">Sesión: {sesionSeleccionada.codigo}</h2>
            <p className="text-slate-500">Creada: {new Date(sesionSeleccionada.creada_en).toLocaleString()}</p>
            <p className="text-slate-500">Tiempo límite: {sesionSeleccionada.tiempo_limite ? `${Math.floor(sesionSeleccionada.tiempo_limite / 60)} minutos` : "No definido"}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1e3a5f] mb-4">Alumnos ({alumnos.length})</h3>
            
            {alumnos.length === 0 ? (
              <p className="text-slate-500">No hay alumnos en esta sesión.</p>
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
                        <span className="text-green-600 font-medium text-sm">✅ Entregado</span>
                      ) : (
                        <span className="text-yellow-600 font-medium text-sm">⏳ Pendiente</span>
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
    );
  }

  // Vista principal: lista de sesiones
  return (
    <div className="min-h-screen bg-[#f7fbfd] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1e3a5f]">Mis sesiones</h2>
          <button
            onClick={onVolver}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            ← Volver al panel
          </button>
        </div>

        {sesiones.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-slate-500">No has creado ninguna sesión todavía.</p>
            <button
              onClick={onVolver}
              className="mt-4 px-4 py-2 bg-[#9ecbff] rounded-lg hover:bg-[#81b0d6] transition"
            >
              Crear mi primera sesión
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sesiones.map((sesion) => (
              <div
                key={sesion.id}
                onClick={() => verDetalleSesion(sesion)}
                className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition border border-transparent hover:border-[#9ecbff]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-[#1e3a5f]">{sesion.codigo}</p>
                    <p className="text-sm text-slate-500">
                      Creada: {new Date(sesion.creada_en).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {sesion.activa ? (
                      <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">Activa</span>
                    ) : (
                      <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">Finalizada</span>
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
  );
}