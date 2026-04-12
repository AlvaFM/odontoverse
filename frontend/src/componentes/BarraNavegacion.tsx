import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  onNavigate: (vista: string) => void;
  vistaActual: string;
}

export default function BarraNavegacion({ onNavigate, vistaActual }: Props) {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    await supabase.auth.signOut();
    onNavigate("seleccion");
    setCerrandoSesion(false);
  };

  return (
    <nav style={{
      backgroundColor: "#2c3e50",
      padding: "10px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{
          color: "#ecf0f1",
          fontSize: "20px",
          margin: 0,
          marginRight: "20px"
        }}>
          🦷 OdontoIA
        </h1>

        <button
          onClick={() => onNavigate("ingresar")}
          style={{
            backgroundColor: vistaActual === "ingresar" ? "#e67e22" : "#3498db",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2980b9"}
          onMouseLeave={(e) => {
            if (vistaActual !== "ingresar") e.currentTarget.style.backgroundColor = "#3498db";
          }}
        >
          🧑‍🎓 Alumno
        </button>

        <button
          onClick={() => onNavigate("login")}
          style={{
            backgroundColor: vistaActual === "login" ? "#e67e22" : "#2ecc71",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#27ae60"}
          onMouseLeave={(e) => {
            if (vistaActual !== "login") e.currentTarget.style.backgroundColor = "#2ecc71";
          }}
        >
          👨‍🏫 Profesor
        </button>

        <button
          onClick={() => onNavigate("seleccion")}
          style={{
            backgroundColor: vistaActual === "seleccion" ? "#e67e22" : "#95a5a6",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🏠 Inicio
        </button>
      </div>

      <button
        onClick={handleLogout}
        disabled={cerrandoSesion}
        style={{
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c0392b"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e74c3c"}
      >
        {cerrandoSesion ? "Cerrando..." : "🚪 Cerrar sesión"}
      </button>
    </nav>
  );
}