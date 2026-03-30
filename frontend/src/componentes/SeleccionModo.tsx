import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginProfesor from "./loginProfesor";
import CrearSesion from "./CrearSesion";
import IngresarSesion from "./IngresarSesion";
import TestSupabase from "./TestSupabase";

export default function SeleccionModo() {
  const [modo, setModo] = useState("");
  const [profesorEmail, setProfesorEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setProfesorEmail(session.user.email);
        setModo("profesor");
      }
      setCargando(false);
    };
    
    verificarSesion();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfesorEmail(null);
    setModo("");
  };

  if (cargando) {
    return <div>Cargando...</div>;
  }

  // Profesor: si no tiene email, mostrar login
  if (modo === "profesor" && !profesorEmail) {
    return <LoginProfesor onLoginSuccess={setProfesorEmail} />;
  }

  if (modo === "profesor" && profesorEmail) {
    return <CrearSesion profesorEmail={profesorEmail} onLogout={handleLogout} />;
  }

  if (modo === "alumno") {
    return <IngresarSesion />;
  }

  if (modo === "pruebasupabase") {
    return <TestSupabase />;
  }

  // Pantalla de selección inicial
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Seleccionar modo</h1>

      <div style={{ display: "flex", gap: "1rem", flexDirection: "column", maxWidth: "200px" }}>
        <button onClick={() => setModo("profesor")}>
          👨‍🏫 Profesor
        </button>

        <button onClick={() => setModo("alumno")}>
          🧑‍🎓 Alumno
        </button>

        <button onClick={() => setModo("pruebasupabase")}>
          🔧 Probar Supabase
        </button>
      </div>
    </div>
  );
}