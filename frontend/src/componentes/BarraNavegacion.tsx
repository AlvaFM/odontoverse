import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/img/logo.png";

interface Props {
  onNavigate: (vista: string) => void;
  vistaActual: string;
  onVolver: () => void;
  sesionIniciada?: boolean;
}

export default function BarraNavegacion({
  onNavigate,
  vistaActual,
  onVolver,
  sesionIniciada = false
}: Props) {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    await supabase.auth.signOut();
    onNavigate("seleccion");
    setCerrandoSesion(false);
  };

  const mostrarVolver = vistaActual !== "seleccion";

  // 🔥 PROGRESO DE ANIMACIÓN (0 → 1)
  const progress = Math.min(scrollY / 80, 1);

  // 🎯 INTERPOLACIONES
  const logoScale = 1 - 0.25 * progress; // se achica
  const logoOpacity = 1 - progress; // se desvanece
  const textOpacity = progress;
  const textTranslate = 8 * (1 - progress); // baja un poco al aparecer

  return (
    <nav
      className="
        sticky top-0 w-full z-50 relative
        flex items-center justify-end
        px-8
        backdrop-blur-xl
        border-b border-white/30
        transition-all duration-300
      "
      style={{
        paddingTop: `${40 - progress * 10}px`,
        paddingBottom: `${40 - progress * 10}px`,
        background: `rgba(255,255,255,${0.6 + progress * 0.2})`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Borde degradado */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

      {/* Volver */}
      {mostrarVolver && (
        <button
          onClick={onVolver}
          className="
            absolute left-6
            px-4 py-2 rounded-lg text-sm font-medium
            bg-white/60 backdrop-blur-md
            text-gray-700
            hover:bg-white/80
            transition-all duration-200
          "
        >
          ← Volver
        </button>
      )}

      {/* Centro */}
      <div
        className="
          absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          flex items-center justify-center
        "
      >
        <button
          onClick={() => onNavigate("seleccion")}
          className="relative flex items-center justify-center"
        >
          {/* LOGO */}
          <img
            src={logo}
            alt="OdontoAI"
            style={{
              transform: `scale(${logoScale})`,
              opacity: logoOpacity,
              transition: "transform 0.1s linear, opacity 0.1s linear",
              height: "56px",
            }}
          />

          {/* TEXTO */}
          <span
            style={{
              opacity: textOpacity,
              transform: `translateY(${textTranslate}px)`,
              transition: "all 0.15s ease-out",
            }}
            className="absolute text-base font-semibold text-[#1e3a5f]"
          >
            OdontoAI
          </span>
        </button>
      </div>

      {/* Logout */}
      {sesionIniciada && (
        <button
          onClick={handleLogout}
          disabled={cerrandoSesion}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            bg-red-100/70 text-red-500
            hover:bg-red-200/80
            transition-all duration-200
          "
        >
          {cerrandoSesion ? "Cerrando..." : "Cerrar sesión"}
        </button>
      )}
    </nav>
  );
}