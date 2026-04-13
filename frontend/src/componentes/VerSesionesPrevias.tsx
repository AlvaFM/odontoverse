import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  profesorEmail: string;
  onVolver: () => void;
}

interface Sesion {
  id: string;
  codigo: string;
  estado: string;
  creada_en: string;
  tiempo_limite: number | null;
}

export default function VerSesionesPrevias({ profesorEmail, onVolver }: Props) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);
  const [respuestas, setRespuestas] = useState<any[]>([]);

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
      console.error("Error cargando sesiones:", error);
    } else if (data) {
      setSesiones(data);
    }
    setCargando(false);
  };

  const verDetalleSesion = async (sesion: Sesion) => {
    setSesionSeleccionada(sesion);
    
    // Cargar respuestas de alumnos
    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre, email")
      .eq("sesion_codigo", sesion.codigo);

    if (alumnos && alumnos.length > 0) {
      const idsAlumnos = alumnos.map(a => a.id);
      
      const { data: respuestasData } = await supabase
        .from("respuestas_alumnos")
        .select(`
          *,
          alumnos (nombre, email),
          preguntas (texto)
        `)
        .in("alumno_id", idsAlumnos);

      setRespuestas(respuestasData || []);
    } else {
      setRespuestas([]);
    }
  };

  if (sesionSeleccionada) {
    return (
      <div>
        <button onClick={() => setSesionSeleccionada(null)}>← Volver</button>
        
        <h2>📋 Detalle de sesión</h2>
        <p><strong>Código:</strong> {sesionSeleccionada.codigo}</p>
        <p><strong>Estado:</strong> {sesionSeleccionada.estado}</p>
        <p><strong>Creada:</strong> {new Date(sesionSeleccionada.creada_en).toLocaleString()}</p>

        <h3>Respuestas de alumnos</h3>
        {respuestas.length === 0 ? (
          <p>No hay respuestas aún</p>
        ) : (
          <div>
            {respuestas.map((r, i) => (
              <div key={i} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                <p><strong>Alumno:</strong> {r.alumnos?.nombre} ({r.alumnos?.email})</p>
                <p><strong>Pregunta:</strong> {r.preguntas?.texto}</p>
                <p><strong>Respuesta:</strong> {r.respuesta}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (cargando) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <button onClick={onVolver}>← Volver al panel</button>
      
      <h2>📚 Mis sesiones previas</h2>
      
      {sesiones.length === 0 ? (
        <p>No has creado ninguna sesión todavía.</p>
      ) : (
        <div>
          {sesiones.map((sesion) => (
            <div 
              key={sesion.id} 
              style={{ 
                border: "1px solid #ddd", 
                padding: "15px", 
                margin: "10px 0",
                borderRadius: "8px",
                cursor: "pointer"
              }}
              onClick={() => verDetalleSesion(sesion)}
            >
              <p><strong>Código:</strong> {sesion.codigo}</p>
              <p><strong>Estado:</strong> {sesion.estado}</p>
              <p><strong>Creada:</strong> {new Date(sesion.creada_en).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}