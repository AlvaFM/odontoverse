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
  const [animando, setAnimando] = useState(false);

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

  const cambiarVista = (nuevaVista: typeof vista) => {
    setAnimando(true);

    setTimeout(() => {
      setVista(nuevaVista);
      setAnimando(false);
    }, 180);
  };

  if (vista === "crear") {
    return (
      <CrearSesion
        profesorEmail={profesorEmail}
        onVolver={() => cambiarVista("dashboard")}
      />
    );
  }

  if (vista === "ver") {
    return (
      <VerSesionesPrevias
        profesorEmail={profesorEmail}
        onVolver={() => cambiarVista("dashboard")}
      />
    );
  }

  return (
    <div
      className={`h-screen w-screen flex flex-col items-center justify-center bg-slate-100 transition-all duration-300 ${
        animando ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-700">
          Panel del profesor
        </h1>
        <p className="text-slate-500 mt-2 text-base md:text-lg">
          Gestiona tus sesiones clínicas
        </p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-slate-700 font-medium">{profesorEmail}</p>
            <p className="text-slate-500 text-sm">
              {cantidadSesiones} sesión{cantidadSesiones !== 1 ? "es" : ""} creada
              {cantidadSesiones !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => cambiarVista("crear")}
            className="w-full py-4 rounded-xl bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2] transition font-medium"
          >
            Crear nueva sesión
          </button>

          <button
            onClick={() => cambiarVista("ver")}
            className="w-full py-4 rounded-xl bg-[#dcebf7] text-[#1e3a5f] hover:bg-[#cfe3f3] transition font-medium"
          >
            Ver sesiones previas
          </button>
        </div>
      </div>
    </div>
  );
}