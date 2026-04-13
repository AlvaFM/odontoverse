import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginProfesor from "./loginProfesor";
import DashboardProfesor from "./DashboardProfesor";
import IngresarSesion from "./IngresarSesion";
import TestSupabase from "./TestSupabase";

import teacherIcon from "../assets/img/teacher.svg";
import studentIcon from "../assets/img/student.svg";
import fixIcon from "../assets/img/fix.svg";

export default function SeleccionModo() {
  const [modo, setModo] = useState("");
  const [profesorEmail, setProfesorEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [animando, setAnimando] = useState(false);

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

  const handleSeleccion = (nuevoModo: string) => {
    setAnimando(true);
    setTimeout(() => {
      setModo(nuevoModo);
      setAnimando(false);
    }, 180);
  };

  if (cargando) {
    return <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-500">Cargando...</div>;
  }

  if (modo === "profesor" && !profesorEmail) {
    return <LoginProfesor onLoginSuccess={setProfesorEmail} />;
  }

  if (modo === "profesor" && profesorEmail) {
    return <DashboardProfesor profesorEmail={profesorEmail} onLogout={handleLogout} />;
  }

  if (modo === "alumno") {
    return <IngresarSesion />;
  }

  if (modo === "pruebasupabase") {
    return <TestSupabase />;
  }

  const opciones = [
    { key: "profesor", label: "Profesor", img: teacherIcon, base: "bg-[#cfeaf6]", hover: "hover:bg-[#b9e0f2]" },
    { key: "alumno", label: "Alumno", img: studentIcon, base: "bg-[#c8e3f3]", hover: "hover:bg-[#b3d8ee]" },
    { key: "pruebasupabase", label: "Probar", img: fixIcon, base: "bg-[#dcebf7]", hover: "hover:bg-[#cfe3f3]" },
  ];

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center bg-slate-100 transition-all duration-300 ${animando ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}>
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-700">Bienvenido a OdontoAI</h1>
        <p className="text-slate-500 mt-2 text-base md:text-lg">Selecciona un modo</p>
      </div>

      <div className="w-full max-w-[80%] h-[60vh] md:h-[55vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-md">
        {opciones.map((op) => (
          <div key={op.key} onClick={() => handleSeleccion(op.key)} className={`flex-1 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${op.base} ${op.hover} hover:scale-[1.05] hover:shadow-xl`}>
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <img src={op.img} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all duration-300" />
            </div>
            <span className="text-slate-700 text-lg font-medium group-hover:text-[#1e3a5f] transition-colors duration-300">{op.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}