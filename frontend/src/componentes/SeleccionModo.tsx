import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginProfesor from "./LoginProfesor";
import CrearSesion from "./CrearSesion";
import IngresarSesion from "./IngresarSesion";
import TestSupabase from "./TestSupabase";

export default function SeleccionModo() {
  const [modo, setModo] = useState("");
  const [profesorEmail, setProfesorEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

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
    return <div className="min-h-screen flex items-center justify-center bg-sky-100 text-slate-600">Cargando...</div>;
  }

  if (modo === "profesor" && !profesorEmail) {
    return <LoginProfesor onLoginSuccess={setProfesorEmail} />;
  }

  if (modo === "profesor" && profesorEmail) {
    return <CrearSesion profesorEmail={profesorEmail} onVolver={handleLogout} />
  }

  if (modo === "alumno") {
    return <IngresarSesion />;
  }

  if (modo === "pruebasupabase") {
    return <TestSupabase />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 w-80 flex flex-col items-center">
        
        <h1 className="text-2xl font-semibold text-slate-700 mb-6">
          Seleccionar modo
        </h1>

        <div className="flex flex-col gap-4 w-full">
          
          <button
            onClick={() => setModo("profesor")}
            className="bg-sky-300 hover:bg-sky-400 text-slate-800 py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            👨‍🏫 Profesor
          </button>

          <button
            onClick={() => setModo("alumno")}
            className="bg-cyan-200 hover:bg-cyan-300 text-slate-800 py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            🧑‍🎓 Alumno
          </button>

          <button
            onClick={() => setModo("pruebasupabase")}
            className="bg-indigo-200 hover:bg-indigo-300 text-slate-800 py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            🔧 Probar Supabase
          </button>

        </div>

      </div>
    </div>
  );
}