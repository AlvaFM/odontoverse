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
  finalizada_en: string | null;
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

  const intervalRef = useRef<number | null>(null);

  const handleVolver = () => {
    if (onVolver) {
      onVolver();
    } else {
      window.location.reload();
    }
  };

  const calcularTiempoRestante = (sesion: Sesion): number => {
    if (sesion.finalizada_en !== null) {
      console.log("Sesion finalizada, tiempo 0");
      return 0;
    }
    if (!sesion.activa) {
      console.log("Sesion no activa, tiempo 0");
      return 0;
    }
    if (!sesion.activada_en || !sesion.tiempo_limite) {
      console.log("Faltan datos:", { activada_en: sesion.activada_en, tiempo_limite: sesion.tiempo_limite });
      return 0;
    }
    
    const activadaEn = new Date(sesion.activada_en).getTime();
    const ahora = Date.now();
    const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
    const restante = Math.max(0, sesion.tiempo_limite - segundosTranscurridos);
    
    console.log("Calculando tiempo:", {
      activada_en: sesion.activada_en,
      tiempo_limite: sesion.tiempo_limite,
      segundosTranscurridos,
      restante
    });
    
    return restante;
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

  const obtenerSesion = async (): Promise<Sesion | null> => {
    const { data, error } = await supabase
      .from("sesiones")
      .select("activa, activada_en, tiempo_limite, finalizada_en")
      .eq("codigo", codigoSesion)
      .maybeSingle();

    if (error) {
      console.error("Error al obtener sesion:", error);
      return null;
    }

    console.log("Sesion obtenida de BD:", data);
    return data as Sesion | null;
  };

  const actualizarEstado = async () => {
    const sesion = await obtenerSesion();
    if (!sesion) return;

    if (sesion.finalizada_en !== null) {
      setSesionFinalizada(true);
      setSesionIniciada(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (sesion.activa) {
      setSesionIniciada(true);
      const restante = calcularTiempoRestante(sesion);
      setTiempoRestante(restante);
      
      if (restante <= 0 && !sesionFinalizada) {
        await finalizarSesion();
      }
    } else {
      setSesionIniciada(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      await cargarAlumnos();
      await actualizarEstado();
      setVerificandoEstado(false);
    };

    inicializar();

    intervalRef.current = window.setInterval(async () => {
      if (!isMounted) return;
      await actualizarEstado();
      await cargarAlumnos();
    }, 1000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const iniciarSesion = async () => {
    if (alumnos.length === 0) {
      alert("No hay alumnos conectados para iniciar la sesion");
      return;
    }

    setCargando(true);

    const tiempoLimite = tiempo * 60;
    const ahora = new Date().toISOString();

    console.log("Iniciando sesion con:", {
      codigoSesion,
      tiempoLimite,
      ahora
    });

    const { error } = await supabase
      .from("sesiones")
      .update({
        activa: true,
        activada_en: ahora,
        tiempo_limite: tiempoLimite,
        finalizada_en: null,
        profesor_email: profesorEmail
      })
      .eq("codigo", codigoSesion);

    if (error) {
      console.error("Error al iniciar sesion:", error);
      setCargando(false);
      alert("Error al iniciar la sesion: " + error.message);
      return;
    }

    // Verificar que se guardó correctamente
    const { data: verificacion } = await supabase
      .from("sesiones")
      .select("activa, activada_en, tiempo_limite, finalizada_en")
      .eq("codigo", codigoSesion)
      .single();

    console.log("Verificacion despues de guardar:", verificacion);

    setSesionFinalizada(false);
    setSesionIniciada(true);
    setTiempoRestante(tiempoLimite);
    setCargando(false);
  };

  const finalizarSesion = async () => {
    if (sesionFinalizada) return;

    const ahora = new Date().toISOString();

    await supabase
      .from("sesiones")
      .update({
        activa: false,
        finalizada_en: ahora
      })
      .eq("codigo", codigoSesion);

    setSesionIniciada(false);
    setSesionFinalizada(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatear = (s: number) => {
    if (s < 0) return "00:00";
    const mins = Math.floor(s / 60);
    const segs = Math.floor(s % 60);
    return `${mins}:${segs.toString().padStart(2, "0")}`;
  };

  if (sesionFinalizada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-5">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Sesion finalizada</h2>
          <p className="text-slate-500">
            {todosEntregaron 
              ? "Todos los alumnos han completado sus respuestas." 
              : "El tiempo de la sesion ha terminado."}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-slate-500">Codigo de sesion</p>
            <p className="text-xl font-bold tracking-widest text-[#1e3a5f]">{codigoSesion}</p>
            <hr className="my-2" />
            <p className="text-sm text-slate-500">Alumnos que respondieron</p>
            <p className="text-lg font-semibold text-green-600">{alumnos.filter(a => a.entregado).length} de {alumnos.length}</p>
          </div>
          <button onClick={handleVolver} className="w-full py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition">
            Volver al panel
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
            <img src={dienteLike} className="w-8 h-8 opacity-70" alt="loading" />
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
            <img src={dienteLike} className="w-10 h-10 object-contain" alt="diente" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Sala activa</h2>
            <p className="text-xs text-slate-400">Codigo {codigoSesion}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Profesor</p>
            <p className="text-sm text-[#1e3a5f] font-medium">{profesorEmail}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-4xl font-bold text-[#1e3a5f] mt-1">
            {sesionIniciada ? formatear(tiempoRestante) : `${tiempo} minutos`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {sesionIniciada ? "En curso" : "Sesion detenida"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">Preguntas activas</h3>
          <ul className="space-y-2 text-slate-600 text-sm">
            {preguntas.map((p, i) => (
              <li key={i} className="bg-slate-50 rounded-lg px-3 py-2 flex justify-between items-center">
                <span>{p.texto}</span>
                <span className="text-xs text-slate-400">
                  {p.tipo === "multiple" ? "Multiple" : "Texto"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1e3a5f] mb-4">Alumnos conectados ({alumnos.length})</h3>
          {alumnos.length === 0 ? (
            <p className="text-sm text-slate-400">Sin alumnos aun</p>
          ) : (
            <ul className="space-y-3">
              {alumnos.map((a) => (
                <li key={a.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5f]">{a.nombre}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </div>
                  {a.entregado ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Entregado</span>
                  ) : (
                    <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">Pendiente</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!sesionFinalizada && (
          <div className="flex gap-3">
            {!sesionIniciada && (
              <button 
                onClick={iniciarSesion} 
                disabled={alumnos.length === 0 || cargando} 
                className="flex-1 py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition disabled:opacity-40"
              >
                {cargando ? "Iniciando..." : "Iniciar sesion"}
              </button>
            )}
            {sesionIniciada && (
              <button 
                onClick={finalizarSesion} 
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
              >
                Finalizar sesion
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}