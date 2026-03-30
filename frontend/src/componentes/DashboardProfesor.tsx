import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import CrearSesion from "./CrearSesion";
import VerSesionesPrevias from "./VerSesionesPrevias";

interface Props {
  profesorEmail: string;
  onLogout: () => void;
}

export default function DashboardProfesor({ profesorEmail, onLogout }: Props) {
  const [vista, setVista] = useState<"dashboard" | "crear" | "ver">("dashboard");
  const [cantidadSesiones, setCantidadSesiones] = useState(0);

  useEffect(() => {
    cargarCantidadSesiones();
  }, []);

  const cargarCantidadSesiones = async () => {
    const { count } = await supabase
      .from("sesiones")
      .select("*", { count: "exact", head: true })
      .eq("profesor_email", profesorEmail);
    
    setCantidadSesiones(count || 0);
  };

  if (vista === "crear") {
    return <CrearSesion profesorEmail={profesorEmail} onVolver={() => setVista("dashboard")} />;
  }

  if (vista === "ver") {
    return <VerSesionesPrevias profesorEmail={profesorEmail} onVolver={() => setVista("dashboard")} />;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📋 Panel del Profesor</h2>
        <button onClick={onLogout} style={{ backgroundColor: "#ccc" }}>
          Cerrar sesión
        </button>
      </div>

      <p><strong>Bienvenido,</strong> {profesorEmail}</p>
      <p>Tienes <strong>{cantidadSesiones}</strong> sesión{ cantidadSesiones !== 1 ? "es" : "" } creada{ cantidadSesiones !== 1 ? "s" : "" }</p>

      <hr />

      <div style={{ display: "flex", gap: "1rem", flexDirection: "column", marginTop: "2rem" }}>
        <button 
          onClick={() => setVista("crear")}
          style={{ padding: "15px", fontSize: "16px" }}
        >
          ✨ Crear nueva sesión
        </button>

        <button 
          onClick={() => setVista("ver")}
          style={{ padding: "15px", fontSize: "16px", backgroundColor: "#2196F3" }}
        >
          📊 Ver sesiones previas
        </button>
      </div>
    </div>
  );
}