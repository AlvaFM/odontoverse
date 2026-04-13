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

  const pollingAlumnosRef = useRef<number | null>(null);
  const pollingSesionRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const cargarAlumnos = async () => {
    const { data } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", codigoSesion);

    if (data) setAlumnos(data as Alumno[]);
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
      }

      setVerificandoEstado(false);
    };

    verificarEstadoSesion();
    cargarAlumnos();

    pollingAlumnosRef.current = window.setInterval(cargarAlumnos, 1500);
    pollingSesionRef.current = window.setInterval(verificarEstadoSesion, 2000);

    return () => {
      if (pollingAlumnosRef.current) clearInterval(pollingAlumnosRef.current);
      if (pollingSesionRef.current) clearInterval(pollingSesionRef.current);
    };
  }, []);

  const iniciarCountdown = (inicio: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    let tiempo = inicio;

    countdownRef.current = window.setInterval(() => {
      tiempo -= 1;
      setTiempoRestante(tiempo);

      if (tiempo <= 0) {
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

  const finalizarSesion = async () => {
    await supabase
      .from("sesiones")
      .update({
        activa: false,
        finalizada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);
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

        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">
            Sala del profesor
          </h2>
          <p className="text-sm text-slate-500">{codigoSesion}</p>
          <p className="text-sm text-slate-500">{profesorEmail}</p>
        </div>

        {/* TIMER */}
        <div className="bg-[#f0f8ff] rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-500">Tiempo restante</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">
            {sesionIniciada ? formatear(tiempoRestante) : `${tiempo}:00`}
          </p>
        </div>

        {/* PREGUNTAS */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">
            Preguntas activas
          </h3>

          <ul className="space-y-1 text-slate-600 text-sm">
            {preguntas.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>

        {/* ALUMNOS */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#1e3a5f] mb-3">
            Alumnos conectados ({alumnos.length})
          </h3>

          {alumnos.length === 0 ? (
            <p className="text-sm text-slate-500">
              Esperando alumnos...
            </p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-600">
              {alumnos.map((a) => (
                <li key={a.id}>
                  {a.nombre} - {a.email}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* BOTONES */}
        <div className="flex gap-3">

          {!sesionIniciada && (
            <button
              onClick={iniciarSesion}
              disabled={alumnos.length === 0 || cargando}
              className="flex-1 py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f]
                         hover:bg-[#81b0d6] transition disabled:opacity-50"
            >
              {cargando ? "Iniciando..." : "Iniciar sesión"}
            </button>
          )}

          {sesionIniciada && (
            <button
              onClick={finalizarSesion}
              className="flex-1 py-3 rounded-xl bg-red-100 text-red-600
                         hover:bg-red-200 transition"
            >
              Finalizar sesión
            </button>
          )}
        </div>

      </div>
    </div>
  );
}