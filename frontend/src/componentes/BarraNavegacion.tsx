import { useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/img/logo.png";

interface Props {
  onNavigate: (vista: string) => void;
  vistaActual: string;
}

export default function BarraNavegacion({ onNavigate }: Props) {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    await supabase.auth.signOut();
    onNavigate("seleccion");
    setCerrandoSesion(false);
  };

  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-50
        flex items-center justify-end
        px-6 py-5
        backdrop-blur-md
        bg-white/70
        border-b border-white/30
        shadow-[0_2px_10px_rgba(0,0,0,0.04)]
        overflow-x-hidden
      "
    >
      {/* LOGO CENTRADO */}
      <button
        onClick={() => onNavigate("seleccion")}
        className="
          absolute left-1/2 -translate-x-1/2
          flex items-center justify-center
          py-1
          hover:opacity-80 transition
        "
      >
        <img
          src={logo}
          alt="OdontoAI"
          className="h-16 w-auto object-contain"
        />
      </button>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        disabled={cerrandoSesion}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-[#fbe9e9]/80 text-red-500
          hover:bg-red-100 hover:text-red-600
          transition-all duration-200
        "
      >
        {cerrandoSesion ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </nav>
  );
}