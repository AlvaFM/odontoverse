import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import dienteLike from "../assets/img/dientelupa.png";

interface Props {
  codigoSesion: string;
  preguntas: { texto: string; tipo: string; opciones?: string[] }[];
  tiempo: number;
  profesorEmail: string;
  onVolver: () => void;
}

interface Alumno {
  id: string;
  nombre: string;
  email: string;
  joined_en: string;
  entregado: boolean;
}

interface Sesion {
  activa: boolean;
  activada_en: string | null;
  tiempo_limite: number | null;
}

export default function SalaProfesor({
  codigoSesion,
  preguntas,
  tiempo,
  profesorEmail,
  onVolver,
}: Props) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [sesionFinalizada, setSesionFinalizada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(tiempo * 60);
  const [cargando, setCargando] = useState(false);
  const [verificandoEstado, setVerificandoEstado] = useState(true);
  const [todosEntregaron, setTodosEntregaron] = useState(false);

  const pollingRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const verificarEntregasRef = useRef<number | null>(null);

  const handleVolver = () => {
    if (onVolver) {
      onVolver();
    } else {
      window.location.reload();
    }
  };

  const cargarAlumnos = async () => {
    const { data } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", codigoSesion);

    if (data) {
      setAlumnos(data as Alumno[]);
    }
  };

  const verificarSiTodosEntregaron = async () => {
    if (!sesionIniciada || sesionFinalizada) return;

    const { data } = await supabase
      .from("alumnos")
      .select("entregado")
      .eq("sesion_codigo", codigoSesion);

    if (data && data.length > 0) {
      const todos = data.every((alumno) => alumno.entregado === true);
      
      if (todos && !todosEntregaron) {
        console.log("✅ Todos los alumnos entregaron, finalizando sesión...");
        setTodosEntregaron(true);
        await finalizarSesion(true);
      }
    }
  };

  useEffect(() => {
    const verificarEstadoSesion = async () => {
      const { data } = await supabase
        .from("sesiones")
        .select("activa, activada_en, tiempo_limite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      const sesion = data as Sesion | null;

      if (sesion?.activa && !sesionIniciada && !sesionFinalizada) {
        setSesionIniciada(true);

        if (sesion.activada_en && sesion.tiempo_limite) {
          const inicio = new Date(sesion.activada_en).getTime();
          const ahora = Date.now();
          const restante = Math.max(
            0,
            sesion.tiempo_limite - Math.floor((ahora - inicio) / 1000)
          );

          setTiempoRestante(restante);
          iniciarCountdown(restante);
        }
      }

      if (!sesion?.activa && sesionIniciada) {
        setSesionIniciada(false);
        setSesionFinalizada(true);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (verificarEntregasRef.current) clearInterval(verificarEntregasRef.current);
      }

      setVerificandoEstado(false);
    };

    verificarEstadoSesion();
    cargarAlumnos();

    pollingRef.current = window.setInterval(() => {
      cargarAlumnos();
      verificarEstadoSesion();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (verificarEntregasRef.current) clearInterval(verificarEntregasRef.current);
    };
  }, []);

  useEffect(() => {
    if (sesionIniciada && !sesionFinalizada) {
      verificarSiTodosEntregaron();
      verificarEntregasRef.current = window.setInterval(() => {
        verificarSiTodosEntregaron();
      }, 1000);
    }

    return () => {
      if (verificarEntregasRef.current) clearInterval(verificarEntregasRef.current);
    };
  }, [sesionIniciada, sesionFinalizada]);

  const iniciarCountdown = (inicio: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    let tiempoActual = inicio;

    countdownRef.current = window.setInterval(() => {
      tiempoActual -= 1;
      setTiempoRestante(tiempoActual);

      if (tiempoActual <= 0) {
        clearInterval(countdownRef.current!);
        finalizarSesion();
      }
    }, 1000);
  };

  const iniciarSesion = async () => {
    if (alumnos.length === 0) return;

    setCargando(true);

    await supabase
      .from("sesiones")
      .update({
        activa: true,
        activada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    setSesionIniciada(true);
    setCargando(false);
    iniciarCountdown(tiempo * 60);
  };

  const finalizarSesion = async (automatico = false) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (verificarEntregasRef.current) clearInterval(verificarEntregasRef.current);

    await supabase
      .from("sesiones")
      .update({
        activa: false,
        finalizada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    setSesionIniciada(false);
    setSesionFinalizada(true);
  };

  const formatear = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Pantalla de sesión finalizada
  if (sesionFinalizada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-5">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">¡Sesión finalizada!</h2>
          <p className="text-slate-500">
            {todosEntregaron 
              ? "Todos los alumnos han completado sus respuestas." 
              : "El tiempo de la sesión ha terminado."}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-slate-500">Código de sesión</p>
            <p className="text-xl font-bold tracking-widest text-[#1e3a5f]">{codigoSesion}</p>
            <hr className="my-2" />
            <p className="text-sm text-slate-500">Alumnos que respondieron</p>
            <p className="text-lg font-semibold text-green-600">{alumnos.filter(a => a.entregado).length} de {alumnos.length}</p>
          </div>
          <button onClick={handleVolver} className="w-full py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition">
            ← Volver al panel
          </button>
        </div>
      </div>
    );
  }

  if (verificandoEstado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb]">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#eef6ff] rounded-xl flex items-center justify-center animate-pulse">
            <img src={dienteLike} className="w-8 h-8 opacity-70" />
          </div>
          <p className="text-sm text-slate-500">Cargando sala</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef6fb] p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#eef6ff] rounded-2xl flex items-center justify-center">
            <img src={dienteLike} className="w-10 h-10 object-contain" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Sala activa</h2>
            <p className="text-xs text-slate-400">Código {codigoSesion}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Profesor</p>
            <p className="text-sm text-[#1e3a5f] font-medium">{profesorEmail}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-4xl font-bold text-[#1e3a5f] mt-1">
            {sesionIniciada ? formatear(tiempoRestante) : "--:--"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {sesionIniciada ? "En curso" : "Sesión detenida"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">Preguntas activas</h3>
          <ul className="space-y-2 text-slate-600 text-sm">
            {preguntas.map((p, i) => (
              <li key={i} className="bg-slate-50 rounded-lg px-3 py-2 flex justify-between items-center">
                <span>{p.texto}</span>
                <span className="text-xs text-slate-400">
                  {p.tipo === "multiple" ? "🔘 Múltiple" : "📝 Texto"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1e3a5f] mb-4">Alumnos conectados ({alumnos.length})</h3>
          {alumnos.length === 0 ? (
            <p className="text-sm text-slate-400">Sin alumnos aún</p>
          ) : (
            <ul className="space-y-3">
              {alumnos.map((a) => (
                <li key={a.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5f]">{a.nombre}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </div>
                  {a.entregado ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">✅ Entregado</span>
                  ) : (
                    <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">⏳ Pendiente</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!sesionFinalizada && (
          <div className="flex gap-3">
            {!sesionIniciada && (
              <button onClick={iniciarSesion} disabled={alumnos.length === 0 || cargando} className="flex-1 py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition disabled:opacity-40">
                {cargando ? "Iniciando..." : "🚀 Iniciar sesión"}
              </button>
            )}
            {sesionIniciada && (
              <button onClick={() => finalizarSesion(false)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition">
                ⏹️ Finalizar sesión
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}