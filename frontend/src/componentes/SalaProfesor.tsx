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
  estado: string;
  activada_en: string | null;
  tiempo_límite: number | null;
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
  const pollingEstadoRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollingAlumnosRef.current) clearInterval(pollingAlumnosRef.current);
      if (pollingEstadoRef.current) clearInterval(pollingEstadoRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Cargar alumnos periódicamente
  useEffect(() => {
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

    cargarAlumnos();
    pollingAlumnosRef.current = window.setInterval(cargarAlumnos, 3000);

    return () => {
      if (pollingAlumnosRef.current) clearInterval(pollingAlumnosRef.current);
    };
  }, [codigoSesion]);

  // Verificar estado de la sesión periódicamente
  useEffect(() => {
    const verificarEstadoSesion = async () => {
      const { data, error } = await supabase
        .from("sesiones")
        .select("estado, activada_en, tiempo_límite")
        .eq("codigo", codigoSesion)
        .maybeSingle();

      if (error) {
        console.error("Error al verificar sesión:", error);
        setVerificandoEstado(false);
        return;
      }

      const sesion = data as Sesion | null;

      if (sesion?.estado === "activa" && !sesionIniciada) {
        setSesionIniciada(true);
        
        // Calcular tiempo restante
        if (sesion.activada_en && sesion.tiempo_límite) {
          const activadaEn = new Date(sesion.activada_en).getTime();
          const ahora = new Date().getTime();
          const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
          const restante = Math.max(0, sesion.tiempo_límite - segundosTranscurridos);
          setTiempoRestante(restante);
          
          if (restante > 0) {
            iniciarCountdown(restante);
          } else {
            finalizarSesion();
          }
        }
      }
      
      setVerificandoEstado(false);
    };

    verificarEstadoSesion();
    pollingEstadoRef.current = window.setInterval(verificarEstadoSesion, 2000);

    return () => {
      if (pollingEstadoRef.current) clearInterval(pollingEstadoRef.current);
    };
  }, [codigoSesion, sesionIniciada]);

  const iniciarCountdown = (tiempoInicial: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = window.setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          finalizarSesion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const iniciarSesion = async () => {
    if (alumnos.length === 0) {
      alert("Debe haber al menos un alumno conectado para iniciar la sesión");
      return;
    }

    setCargando(true);

    const { error } = await supabase
      .from("sesiones")
      .update({
        estado: "activa",
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
    if (countdownRef.current) clearInterval(countdownRef.current);
    
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

  if (verificandoEstado) {
    return <div>Cargando sala...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Sala del profesor</h2>

      <p><strong>Código sesión:</strong> {codigoSesion}</p>
      <p><strong>Profesor:</strong> {profesorEmail}</p>

      {sesionIniciada ? (
        <div style={{ backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "8px" }}>
          <h3>⏱️ Sesión activa</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            Tiempo restante: {formatearTiempo(tiempoRestante)}
          </p>
        </div>
      ) : (
        <div>
          <p><strong>Tiempo total:</strong> {tiempo} minutos</p>
        </div>
      )}

      <h3>📋 Preguntas activas</h3>
      <ul>
        {preguntas.map((p, i) => (
          <li key={i}>{i + 1}. {p}</li>
        ))}
      </ul>

      <h3>👨‍🎓 Alumnos conectados ({alumnos.length})</h3>
      {alumnos.length === 0 ? (
        <p>Esperando alumnos... (actualizando cada 3 segundos)</p>
      ) : (
        <ul>
          {alumnos.map((alumno) => (
            <li key={alumno.id}>{alumno.nombre} - {alumno.email}</li>
          ))}
        </ul>
      )}

      {!sesionIniciada && (
        <button 
          onClick={iniciarSesion} 
          disabled={cargando || alumnos.length === 0}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: alumnos.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          {cargando ? "Iniciando..." : "🚀 Iniciar temporizador"}
        </button>
      )}

      {sesionIniciada && (
        <button 
          onClick={finalizarSesion} 
          style={{ 
            backgroundColor: "red", 
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ⏹️ Finalizar sesión
        </button>
      )}
    </div>
  );
}