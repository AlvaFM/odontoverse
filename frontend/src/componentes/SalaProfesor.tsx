import { useEffect, useState } from "react";
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

  // Cargar alumnos existentes y suscribirse a nuevos
  useEffect(() => {
    cargarAlumnos();

    // Escuchar nuevos alumnos en tiempo real
    const subscription = supabase
      .channel(`sala_${codigoSesion}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alumnos",
          filter: `sesion_codigo=eq.${codigoSesion}`,
        },
        (payload) => {
          const nuevoAlumno = payload.new as Alumno;
          setAlumnos((prev) => [...prev, nuevoAlumno]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [codigoSesion]);

  const cargarAlumnos = async () => {
    const { data, error } = await supabase
      .from("alumnos")
      .select("*")
      .eq("sesion_codigo", codigoSesion);

    if (error) {
      console.error("Error al cargar alumnos:", error);
    } else if (data) {
      setAlumnos(data);
    }
  };

  const iniciarSesion = async () => {
    setCargando(true);

    // Actualizar estado de la sesión a "activa"
    const { error } = await supabase
      .from("sesiones")
      .update({
        estado: "activa",
        activada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    if (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar la sesión");
      setCargando(false);
      return;
    }

    setSesionIniciada(true);
    setCargando(false);

    // Iniciar countdown
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          finalizarSesion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finalizarSesion = async () => {
    const { error } = await supabase
      .from("sesiones")
      .update({
        estado: "finalizada",
        finalizada_en: new Date().toISOString(),
      })
      .eq("codigo", codigoSesion);

    if (error) {
      console.error("Error al finalizar sesión:", error);
    } else {
      alert("Sesión finalizada. Los alumnos ya no pueden responder.");
    }
  };

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h2>Sala del profesor</h2>

      <p>
        <strong>Código sesión:</strong> {codigoSesion}
      </p>
      <p>
        <strong>Profesor:</strong> {profesorEmail}
      </p>

      {sesionIniciada ? (
        <div>
          <h3>⏱️ Sesión activa</h3>
          <p>
            <strong>Tiempo restante:</strong> {formatearTiempo(tiempoRestante)}
          </p>
        </div>
      ) : (
        <div>
          <p>
            <strong>Tiempo total:</strong> {tiempo} minutos
          </p>
        </div>
      )}

      <h3>📋 Preguntas activas</h3>
      <ul>
        {preguntas.map((p, i) => (
          <li key={i}>
            {i + 1}. {p}
          </li>
        ))}
      </ul>

      <h3>👨‍🎓 Alumnos conectados ({alumnos.length})</h3>
      {alumnos.length === 0 ? (
        <p>Esperando alumnos...</p>
      ) : (
        <ul>
          {alumnos.map((alumno) => (
            <li key={alumno.id}>
              {alumno.nombre} - {alumno.email}
            </li>
          ))}
        </ul>
      )}

      {!sesionIniciada && (
        <button onClick={iniciarSesion} disabled={cargando || alumnos.length === 0}>
          {cargando ? "Iniciando..." : "🚀 Iniciar temporizador"}
        </button>
      )}

      {sesionIniciada && (
        <button onClick={finalizarSesion} style={{ backgroundColor: "red" }}>
          ⏹️ Finalizar sesión
        </button>
      )}
    </div>
  );
}