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
  
  // Refs para limpiar intervalos
  const pollingRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // Función para cargar alumnos desde Supabase
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

  // Verificar estado actual de la sesión al cargar
  useEffect(() => {
    const verificarEstadoSesion = async () => {
      const { data: sesion } = await supabase
        .from("sesiones")
        .select("estado, activada_en")
        .eq("codigo", codigoSesion)
        .single();

      if (sesion?.estado === "activa") {
        setSesionIniciada(true);
        
        // Calcular tiempo restante si ya estaba activa
        if (sesion.activada_en) {
          const activadaEn = new Date(sesion.activada_en).getTime();
          const ahora = new Date().getTime();
          const segundosTranscurridos = Math.floor((ahora - activadaEn) / 1000);
          const tiempoRestanteCalc = Math.max(0, (tiempo * 60) - segundosTranscurridos);
          setTiempoRestante(tiempoRestanteCalc);
          
          if (tiempoRestanteCalc > 0) {
            iniciarCountdown(tiempoRestanteCalc);
          } else {
            finalizarSesion();
          }
        }
      }
      
      setVerificandoEstado(false);
    };

    verificarEstadoSesion();
    
    // Cargar alumnos inicialmente
    cargarAlumnos();

    // POLLING: cada 1 segundo recargar la lista de alumnos
    pollingRef.current = window.setInterval(() => {
      cargarAlumnos();
    }, 1000);

    // Suscripción en tiempo real como respaldo (opcional)
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

    // Limpiar al desmontar
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      subscription.unsubscribe();
    };
  }, [codigoSesion]);

  const iniciarCountdown = (tiempoInicial?: number) => {
    // Limpiar countdown anterior si existe
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    const segundosIniciales = tiempoInicial !== undefined ? tiempoInicial : tiempo * 60;
    
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
      alert("Error al iniciar la sesión: " + error.message);
      setCargando(false);
      return;
    }

    setSesionIniciada(true);
    setCargando(false);
    iniciarCountdown();
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

      <p>
        <strong>Código sesión:</strong> {codigoSesion}
      </p>
      <p>
        <strong>Profesor:</strong> {profesorEmail}
      </p>

      {sesionIniciada ? (
        <div style={{ backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "8px" }}>
          <h3>⏱️ Sesión activa</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            Tiempo restante: {formatearTiempo(tiempoRestante)}
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
        <p>Esperando alumnos... (actualizando cada 1 segundo)</p>
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