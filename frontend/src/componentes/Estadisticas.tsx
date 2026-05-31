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

// ─── Mini PieChart SVG ───────────────────────────────────────────────────────
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
        <text x="18" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8">—</text>
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

// ─── Barra de progreso ───────────────────────────────────────────────────────
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

// ─── Color según porcentaje ──────────────────────────────────────────────────
function colorPct(pct: number) {
  if (pct >= 70) return { text: "text-green-600", bg: "bg-green-50", bar: "#22c55e" };
  if (pct >= 40) return { text: "text-amber-600", bg: "bg-amber-50", bar: "#f59e0b" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "#ef4444" };
}

// ─── Insignia de rendimiento ─────────────────────────────────────────────────
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

    // 1. Alumnos
    const { data: alumnosData } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", sesion.codigo);
    const alumnos: Alumno[] = (alumnosData as Alumno[]) || [];

    // 2. Preguntas de la sesión
    const { data: preguntasData } = await supabase
      .from("preguntas")
      .select("*")
      .eq("sesion_codigo", sesion.codigo)
      .order("orden");
    const preguntas: Pregunta[] = (preguntasData as Pregunta[]) || [];

    // 3. Respuestas de todos los alumnos de esta sesión
    const alumnoIds = alumnos.map((a) => a.id);
    let respuestas: Respuesta[] = [];
    if (alumnoIds.length > 0) {
      const { data: respData } = await supabase
        .from("respuestas_alumnos")
        .select("*")
        .in("alumno_id", alumnoIds);
      respuestas = (respData as Respuesta[]) || [];
    }

    // 4. Calcular estadísticas por alumno
    // Solo preguntas de opción múltiple con respuesta_correcta definida son "evaluables"
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

    // 5. Estadísticas por pregunta
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

    // 6. Promedio general
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

  // ── Pantalla de carga ──────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb]">
        <p className="text-slate-400 animate-pulse">Cargando estadísticas...</p>
      </div>
    );
  }

  // ── Detalle de sesión ──────────────────────────────────────────────────────
  if (sesionSeleccionada) {
    return (
      <div className="min-h-screen bg-[#eef6fb] px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
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
            <span className="text-xs text-slate-400">Sesión {sesionSeleccionada.codigo}</span>
          </div>

          {cargandoStats ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
              <p className="text-slate-400 animate-pulse">Calculando estadísticas...</p>
            </div>
          ) : stats ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
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
                        {stats.preguntas.filter((p) => p.tipo === "multiple").length} múltiple
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

              {/* Tabs */}
              <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 flex gap-1">
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

              {/* Tab: Resumen */}
              {tabActiva === "resumen" && (
                <div className="space-y-4">
                  {/* Distribución rendimiento */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-[#1e3a5f] mb-4">Distribución de rendimiento</h3>
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

                  {/* Pregunta más difícil / más fácil */}
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
                              <p className="text-xs font-semibold text-red-500 mb-1">Más difícil</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{masDificil.pregunta.texto}</p>
                              <p className="text-xl font-bold text-red-500 mt-2">{masDificil.porcentaje}%</p>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                              <p className="text-xs font-semibold text-green-600 mb-1">Más fácil</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{masFacil.pregunta.texto}</p>
                              <p className="text-xl font-bold text-green-600 mt-2">{masFacil.porcentaje}%</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Margen de mejora */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
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

              {/* Tab: Por alumno */}
              {tabActiva === "alumnos" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-semibold text-[#1e3a5f]">Rendimiento por alumno</h3>
                  {stats.porAlumno.length === 0 ? (
                    <p className="text-sm text-slate-400">Sin alumnos en esta sesión.</p>
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
                                <span className="text-green-600">✓ {e.aciertos} aciertos</span>
                                <span className="text-red-400">✗ {e.errores} errores</span>
                                {!e.alumno.entregado && (
                                  <span className="text-amber-500">No entregó</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Por pregunta */}
              {tabActiva === "preguntas" && (
                <div className="space-y-3">
                  {stats.porPregunta.map((ep, idx) => {
                    const esEvaluable =
                      ep.pregunta.tipo === "multiple" &&
                      ep.pregunta.respuesta_correcta !== null &&
                      ep.pregunta.respuesta_correcta !== undefined;
                    const col = esEvaluable ? colorPct(ep.porcentaje) : { text: "text-slate-500", bg: "bg-slate-50", bar: "#94a3b8" };

                    return (
                      <div key={ep.pregunta.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-0.5">Pregunta {idx + 1}</p>
                            <p className="text-sm font-medium text-[#1e3a5f]">{ep.pregunta.texto}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {ep.pregunta.tipo === "multiple" ? (
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">🔘 Múltiple</span>
                            ) : (
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">📝 Texto</span>
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
                              <span className="text-green-600">✓ {ep.aciertos} correctas</span>
                              <span className="text-red-400">✗ {ep.errores} incorrectas</span>
                              <span>{ep.totalRespondida} respondieron</span>
                            </div>
                          </>
                        )}

                        {/* Distribución de opciones */}
                        {ep.pregunta.tipo === "multiple" && ep.pregunta.opciones && ep.pregunta.opciones.length > 0 && ep.totalRespondida > 0 && (
                          <div className="space-y-1.5 mt-2">
                            <p className="text-xs text-slate-400 mb-1">Distribución de respuestas</p>
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
                          <p className="text-xs text-slate-400 italic">Las preguntas de texto abierto no se evalúan automáticamente.</p>
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
    );
  }

  // ── Lista de sesiones ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#eef6fb] px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#1e3a5f]">Estadísticas</h2>
          <button
            onClick={onVolver}
            className="text-sm bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition text-slate-600"
          >
            ← Volver al panel
          </button>
        </div>

        <p className="text-sm text-slate-500">Selecciona una sesión para ver sus estadísticas.</p>

        {sesiones.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <p className="text-slate-400">No hay sesiones creadas aún.</p>
            <button
              onClick={onVolver}
              className="mt-4 px-4 py-2 bg-[#7bb6ff] text-white rounded-xl hover:bg-[#5fa4f0] transition text-sm"
            >
              Crear primera sesión
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sesiones.map((sesion) => (
              <button
                key={sesion.id}
                onClick={() => cargarEstadisticas(sesion)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-[#7bb6ff] hover:shadow-md transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1e3a5f]">{sesion.codigo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(sesion.creada_en).toLocaleDateString("es-CL", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sesion.activa ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Activa</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Finalizada</span>
                    )}
                    <span className="text-slate-300 text-lg">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
