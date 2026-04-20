import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  codigoSesion: string;
  preguntas: string[];
  tiempo: number;
  profesorEmail: string;
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
}: Props) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(tiempo * 60);
  const [cargando, setCargando] = useState(false);
  const [verificandoEstado, setVerificandoEstado] = useState(true);

  const pollingRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const cargarAlumnos = async () => {
    const { data, error } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", codigoSesion);

    if (error) {
      console.error("Error al cargar alumnos:", error);
    } else if (data) {
      setAlumnos(data as Alumno[]);
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

      if (sesion?.activa && !sesionIniciada) {
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
      } else if (!sesion?.activa && sesionIniciada) {
        // La sesión fue finalizada por el profesor
        setSesionIniciada(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
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
    };
  }, []);

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

    const { error } = await supabase
      .from("sesiones")
      .update({
        activa: true,
        activada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    if (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar la sesión: " + error.message);
      setCargando(false);
      return;
    }

    setSesionIniciada(true);
    setCargando(false);
    iniciarCountdown(tiempo * 60);
  };

  const finalizarSesion = async () => {
    // Detener el countdown localmente
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Actualizar la sesión en Supabase
    const { error } = await supabase
      .from("sesiones")
      .update({
        activa: false,
        finalizada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    if (error) {
      console.error("Error al finalizar sesión:", error);
      alert("Error al finalizar la sesión: " + error.message);
    } else {
      setSesionIniciada(false);
      alert("✅ Sesión finalizada. Los alumnos ya no pueden responder.");
    }
  };

  const formatear = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (verificandoEstado) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando sala...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbfd] p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Sala del profesor</h2>
          <p className="text-sm text-slate-500">{codigoSesion}</p>
          <p className="text-sm text-slate-500">{profesorEmail}</p>
        </div>

        <div className="bg-[#f0f8ff] rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">
            {sesionIniciada ? formatear(tiempoRestante) : "Sesión finalizada"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">Preguntas activas</h3>
          <ul className="space-y-1 text-slate-600 text-sm">
            {preguntas.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">
            Alumnos conectados ({alumnos.length})
          </h3>

          {alumnos.length === 0 ? (
            <p className="text-sm text-slate-500">Esperando alumnos...</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {alumnos.map((a) => (
                <li key={a.id} className="flex justify-between items-center border-b pb-2">
                  <span>{a.nombre} - {a.email}</span>
                  {a.entregado === true ? (
                    <span className="text-green-600 font-medium">✅ Entregado</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">⏳ Pendiente</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          {!sesionIniciada && (
            <button
              onClick={iniciarSesion}
              disabled={alumnos.length === 0 || cargando}
              className="flex-1 py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50"
            >
              {cargando ? "Iniciando..." : "🚀 Iniciar sesión"}
            </button>
          )}

          {sesionIniciada && (
            <button
              onClick={finalizarSesion}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              ⏹️ Finalizar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}