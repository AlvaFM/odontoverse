import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  profesorEmail: string;
  onVolver: () => void;
  sesionInicial?: Sesion;
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
  entregado: boolean;
}

interface Pregunta {
  id: string;
  texto: string;
  orden: number;
  tipo: string;
  opciones?: string[];
  respuesta_correcta?: number | null;
}

interface Respuesta {
  alumno_id: string;
  pregunta_id: string;
  respuesta: string;
  opcion_seleccionada: number | null;
}

interface EstadisticaAlumno {
  alumno: Alumno;
  aciertos: number;
  errores: number;
  total: number;
  porcentaje: number;
}

interface EstadisticaPregunta {
  pregunta: Pregunta;
  totalRespondida: number;
  aciertos: number;
  errores: number;
  porcentaje: number;
  distribucionOpciones: number[];
}

interface EstadisticasSesion {
  sesion: Sesion;
  alumnos: Alumno[];
  preguntas: Pregunta[];
  respuestas: Respuesta[];
  porAlumno: EstadisticaAlumno[];
  porPregunta: EstadisticaPregunta[];
  promedioGeneral: number;
  totalEntregados: number;
}

function PieChart({
  aciertos,
  errores,
  size = 80,
}: {
  aciertos: number;
  errores: number;
  size?: number;
}) {
  const total = aciertos + errores;
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <text x="18" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8">-</text>
      </svg>
    );
  }

  const pct = aciertos / total;
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={pct >= 0.7 ? "#22c55e" : pct >= 0.4 ? "#f59e0b" : "#ef4444"}
        strokeWidth="3.5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function ProgressBar({ value, color = "#7bb6ff" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function colorPct(pct: number) {
  if (pct >= 70) return { text: "text-green-600", bg: "bg-green-50", bar: "#22c55e" };
  if (pct >= 40) return { text: "text-amber-600", bg: "bg-amber-50", bar: "#f59e0b" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "#ef4444" };
}

function Badge({ pct }: { pct: number }) {
  if (pct >= 70) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Bueno</span>;
  if (pct >= 40) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Regular</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Bajo</span>;
}

export default function Estadisticas({ profesorEmail, onVolver, sesionInicial }: Props) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);
  const [stats, setStats] = useState<EstadisticasSesion | null>(null);
  const [cargando, setCargando] = useState(!sesionInicial);
  const [cargandoStats, setCargandoStats] = useState(false);
  const [tabActiva, setTabActiva] = useState<"alumnos" | "preguntas" | "resumen">("resumen");

  useEffect(() => {
    if (sesionInicial) {
      cargarEstadisticas(sesionInicial);
    } else {
      cargarSesiones();
    }
  }, []);

  const cargarSesiones = async () => {
    const { data } = await supabase
      .from("sesiones")
      .select("*")
      .eq("profesor_email", profesorEmail)
      .order("creada_en", { ascending: false });

    setSesiones((data as Sesion[]) || []);
    setCargando(false);
  };

  const cargarEstadisticas = async (sesion: Sesion) => {
    setCargandoStats(true);
    setSesionSeleccionada(sesion);

    const { data: alumnosData } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", sesion.codigo);
    const alumnos: Alumno[] = (alumnosData as Alumno[]) || [];

    const { data: preguntasData } = await supabase
      .from("preguntas")
      .select("*")
      .eq("sesion_codigo", sesion.codigo)
      .order("orden");
    const preguntas: Pregunta[] = (preguntasData as Pregunta[]) || [];

    const alumnoIds = alumnos.map((a) => a.id);
    let respuestas: Respuesta[] = [];
    if (alumnoIds.length > 0) {
      const { data: respData } = await supabase
        .from("respuestas_alumnos")
        .select("*")
        .in("alumno_id", alumnoIds);
      respuestas = (respData as Respuesta[]) || [];
    }

    const preguntasEvaluables = preguntas.filter(
      (p) => p.tipo === "multiple" && p.respuesta_correcta !== null && p.respuesta_correcta !== undefined
    );

    const porAlumno: EstadisticaAlumno[] = alumnos.map((alumno) => {
      const respsAlumno = respuestas.filter((r) => r.alumno_id === alumno.id);
      let aciertos = 0;
      let errores = 0;

      preguntasEvaluables.forEach((preg) => {
        const resp = respsAlumno.find((r) => r.pregunta_id === preg.id);
        if (resp) {
          if (resp.opcion_seleccionada === preg.respuesta_correcta) {
            aciertos++;
          } else {
            errores++;
          }
        }
      });

      const total = aciertos + errores;
      const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

      return { alumno, aciertos, errores, total, porcentaje };
    });

    const porPregunta: EstadisticaPregunta[] = preguntas.map((preg) => {
      const respsPreg = respuestas.filter((r) => r.pregunta_id === preg.id);
      let aciertos = 0;
      let errores = 0;

      const distribucionOpciones = preg.opciones ? Array(preg.opciones.length).fill(0) : [];

      respsPreg.forEach((r) => {
        if (preg.tipo === "multiple" && r.opcion_seleccionada !== null) {
          if (distribucionOpciones[r.opcion_seleccionada] !== undefined) {
            distribucionOpciones[r.opcion_seleccionada]++;
          }
          if (
            preg.respuesta_correcta !== null &&
            preg.respuesta_correcta !== undefined
          ) {
            if (r.opcion_seleccionada === preg.respuesta_correcta) {
              aciertos++;
            } else {
              errores++;
            }
          }
        }
      });

      const totalRespondida = respsPreg.length;
      const porcentaje =
        aciertos + errores > 0
          ? Math.round((aciertos / (aciertos + errores)) * 100)
          : 0;

      return { pregunta: preg, totalRespondida, aciertos, errores, porcentaje, distribucionOpciones };
    });

    const totalEntregados = alumnos.filter((a) => a.entregado).length;
    const promedioGeneral =
      porAlumno.length > 0
        ? Math.round(
            porAlumno.reduce((acc, e) => acc + e.porcentaje, 0) / porAlumno.length
          )
        : 0;

    setStats({
      sesion,
      alumnos,
      preguntas,
      respuestas,
      porAlumno,
      porPregunta,
      promedioGeneral,
      totalEntregados,
    });

    setCargandoStats(false);
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-[#e8edf2] flex items-center justify-center">
        <div className="text-slate-500">Cargando estadisticas...</div>
      </div>
    );
  }

  if (sesionSeleccionada) {
    return (
      <div className="fixed inset-0 bg-[#e8edf2] overflow-y-auto">
        <div className="min-h-full w-full flex flex-col items-center py-8">
          <div className="w-full max-w-3xl px-4 pt-40 pb-12">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  if (sesionInicial) {
                    onVolver();
                  } else {
                    setSesionSeleccionada(null);
                    setStats(null);
                  }
                }}
                className="text-sm bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition text-slate-600"
              >
                ← Volver
              </button>
              <span className="text-xs text-slate-400">Sesion {sesionSeleccionada.codigo}</span>
            </div>

            {cargandoStats ? (
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-10 text-center shadow-sm border border-slate-100">
                <p className="text-slate-400">Calculando estadisticas...</p>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      label: "Promedio general",
                      value: `${stats.promedioGeneral}%`,
                      color: colorPct(stats.promedioGeneral),
                      sub: <Badge pct={stats.promedioGeneral} />,
                    },
                    {
                      label: "Alumnos",
                      value: stats.alumnos.length,
                      color: { text: "text-[#1e3a5f]", bg: "bg-[#eef6ff]", bar: "#7bb6ff" },
                      sub: <span className="text-xs text-slate-400">{stats.totalEntregados} entregaron</span>,
                    },
                    {
                      label: "Preguntas",
                      value: stats.preguntas.length,
                      color: { text: "text-[#1e3a5f]", bg: "bg-[#eef6ff]", bar: "#7bb6ff" },
                      sub: (
                        <span className="text-xs text-slate-400">
                          {stats.preguntas.filter((p) => p.tipo === "multiple").length} multiple
                        </span>
                      ),
                    },
                  ].map((kpi, i) => (
                    <div key={i} className={`${kpi.color.bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
                      <p className={`text-2xl font-bold ${kpi.color.text}`}>{kpi.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                      <div className="mt-1.5 flex justify-center">{kpi.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-slate-100 flex gap-1 mb-5">
                  {(["resumen", "alumnos", "preguntas"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTabActiva(tab)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition capitalize ${
                        tabActiva === tab
                          ? "bg-[#7bb6ff] text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {tab === "resumen" ? "Resumen" : tab === "alumnos" ? "Por alumno" : "Por pregunta"}
                    </button>
                  ))}
                </div>

                {tabActiva === "resumen" && (
                  <div className="space-y-4">
                    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100">
                      <h3 className="font-semibold text-[#1e3a5f] mb-4">Distribucion de rendimiento</h3>
                      {(() => {
                        const buenos = stats.porAlumno.filter((e) => e.porcentaje >= 70).length;
                        const regulares = stats.porAlumno.filter((e) => e.porcentaje >= 40 && e.porcentaje < 70).length;
                        const bajos = stats.porAlumno.filter((e) => e.porcentaje < 40).length;
                        const total = stats.porAlumno.length || 1;

                        return (
                          <div className="space-y-3">
                            {[
                              { label: "Bueno (≥70%)", count: buenos, color: "#22c55e", bg: "bg-green-50 text-green-700" },
                              { label: "Regular (40–69%)", count: regulares, color: "#f59e0b", bg: "bg-amber-50 text-amber-700" },
                              { label: "Bajo (<40%)", count: bajos, color: "#ef4444", bg: "bg-red-50 text-red-600" },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-32 text-center ${item.bg}`}>
                                  {item.label}
                                </span>
                                <div className="flex-1">
                                  <ProgressBar value={(item.count / total) * 100} color={item.color} />
                                </div>
                                <span className="text-sm font-semibold text-slate-600 w-8 text-right">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {stats.porPregunta.filter((p) => p.totalRespondida > 0).length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {(() => {
                          const evaluables = stats.porPregunta.filter(
                            (p) => p.pregunta.tipo === "multiple" && p.totalRespondida > 0 &&
                                   p.pregunta.respuesta_correcta !== null
                          );
                          if (evaluables.length === 0) return null;

                          const sorted = [...evaluables].sort((a, b) => a.porcentaje - b.porcentaje);
                          const masDificil = sorted[0];
                          const masFacil = sorted[sorted.length - 1];

                          return (
                            <>
                              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                <p className="text-xs font-semibold text-red-500 mb-1">Mas dificil</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{masDificil.pregunta.texto}</p>
                                <p className="text-xl font-bold text-red-500 mt-2">{masDificil.porcentaje}%</p>
                              </div>
                              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                                <p className="text-xs font-semibold text-green-600 mb-1">Mas facil</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{masFacil.pregunta.texto}</p>
                                <p className="text-xl font-bold text-green-600 mt-2">{masFacil.porcentaje}%</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100">
                      <h3 className="font-semibold text-[#1e3a5f] mb-1">Margen de mejora</h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Brecha entre el promedio actual y el 100%
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <PieChart aciertos={stats.promedioGeneral} errores={100 - stats.promedioGeneral} size={96} />
                          <span className="absolute text-base font-bold text-[#1e3a5f]">
                            {stats.promedioGeneral}%
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Promedio actual</span>
                            <span className="font-semibold text-[#1e3a5f]">{stats.promedioGeneral}%</span>
                          </div>
                          <ProgressBar value={stats.promedioGeneral} color={colorPct(stats.promedioGeneral).bar} />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Margen de mejora</span>
                            <span className="font-semibold text-amber-600">{100 - stats.promedioGeneral}%</span>
                          </div>
                          <ProgressBar value={100 - stats.promedioGeneral} color="#f59e0b" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tabActiva === "alumnos" && (
                  <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-semibold text-[#1e3a5f]">Rendimiento por alumno</h3>
                    {stats.porAlumno.length === 0 ? (
                      <p className="text-sm text-slate-400">Sin alumnos en esta sesion.</p>
                    ) : (
                      <div className="space-y-4">
                        {[...stats.porAlumno]
                          .sort((a, b) => b.porcentaje - a.porcentaje)
                          .map((e, idx) => {
                            const col = colorPct(e.porcentaje);
                            return (
                              <div key={e.alumno.id} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 w-5">#{idx + 1}</span>
                                    <div>
                                      <p className="text-sm font-medium text-[#1e3a5f]">{e.alumno.nombre}</p>
                                      <p className="text-xs text-slate-400">{e.alumno.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge pct={e.porcentaje} />
                                    <span className={`text-base font-bold ${col.text}`}>{e.porcentaje}%</span>
                                  </div>
                                </div>
                                <ProgressBar value={e.porcentaje} color={col.bar} />
                                <div className="flex gap-3 text-xs text-slate-400">
                                  <span className="text-green-600">{e.aciertos} aciertos</span>
                                  <span className="text-red-400">{e.errores} errores</span>
                                  {!e.alumno.entregado && (
                                    <span className="text-amber-500">No entrego</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {tabActiva === "preguntas" && (
                  <div className="space-y-3">
                    {stats.porPregunta.map((ep, idx) => {
                      const esEvaluable =
                        ep.pregunta.tipo === "multiple" &&
                        ep.pregunta.respuesta_correcta !== null &&
                        ep.pregunta.respuesta_correcta !== undefined;
                      const col = esEvaluable ? colorPct(ep.porcentaje) : { text: "text-slate-500", bg: "bg-slate-50", bar: "#94a3b8" };

                      return (
                        <div key={ep.pregunta.id} className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-100">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-0.5">Pregunta {idx + 1}</p>
                              <p className="text-sm font-medium text-[#1e3a5f]">{ep.pregunta.texto}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {ep.pregunta.tipo === "multiple" ? (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Multiple</span>
                              ) : (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Texto</span>
                              )}
                              {esEvaluable && (
                                <span className={`text-base font-bold ${col.text}`}>{ep.porcentaje}%</span>
                              )}
                            </div>
                          </div>

                          {esEvaluable && (
                            <>
                              <ProgressBar value={ep.porcentaje} color={col.bar} />
                              <div className="flex gap-3 text-xs text-slate-400 mt-1.5 mb-3">
                                <span className="text-green-600">{ep.aciertos} correctas</span>
                                <span className="text-red-400">{ep.errores} incorrectas</span>
                                <span>{ep.totalRespondida} respondieron</span>
                              </div>
                            </>
                          )}

                          {ep.pregunta.tipo === "multiple" && ep.pregunta.opciones && ep.pregunta.opciones.length > 0 && ep.totalRespondida > 0 && (
                            <div className="space-y-1.5 mt-2">
                              <p className="text-xs text-slate-400 mb-1">Distribucion de respuestas</p>
                              {ep.pregunta.opciones.map((opcion, oi) => {
                                const count = ep.distribucionOpciones[oi] || 0;
                                const pct = ep.totalRespondida > 0 ? Math.round((count / ep.totalRespondida) * 100) : 0;
                                const esCorrecta = ep.pregunta.respuesta_correcta === oi;
                                return (
                                  <div key={oi} className="flex items-center gap-2">
                                    <span
                                      className={`text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-semibold
                                        ${esCorrecta ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                                    >
                                      {String.fromCharCode(65 + oi)}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-xs text-slate-600 line-clamp-1">{opcion}</span>
                                        {esCorrecta && <span className="text-xs text-green-600">✓</span>}
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="h-1.5 rounded-full transition-all duration-700"
                                          style={{
                                            width: `${pct}%`,
                                            backgroundColor: esCorrecta ? "#22c55e" : "#94a3b8",
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-xs text-slate-400 w-10 text-right">{pct}% ({count})</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {ep.pregunta.tipo === "texto" && (
                            <p className="text-xs text-slate-400 italic">Las preguntas de texto abierto no se evaluan automaticamente.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#e8edf2] overflow-y-auto">
      <div className="min-h-full w-full flex flex-col items-center py-8">
        <div className="w-full max-w-3xl px-4 pt-20 pb-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-700">
              Estadisticas
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
              Revisa el rendimiento de tus sesiones clinicas
            </p>
          </div>

          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onVolver}
                className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition text-slate-700"
              >
                ← Volver al panel
              </button>
              <span className="text-sm text-slate-500">{profesorEmail}</span>
            </div>

            {sesiones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No hay sesiones creadas aun.</p>
                <button
                  onClick={onVolver}
                  className="mt-4 px-4 py-2 bg-[#9ecbff] rounded-lg hover:bg-[#81b0d6] transition text-slate-700 font-medium"
                >
                  Crear primera sesion
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sesiones.map((sesion) => (
                  <button
                    key={sesion.id}
                    onClick={() => cargarEstadisticas(sesion)}
                    className="w-full bg-white/50 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition border border-slate-200/50 hover:border-[#9ecbff] text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[#1e3a5f]">{sesion.codigo}</p>
                        <p className="text-sm text-slate-500">
                          Creada:{" "}
                          {new Date(sesion.creada_en).toLocaleDateString("es-CL", {
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
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}