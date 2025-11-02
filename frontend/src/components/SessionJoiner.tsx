import { useState } from "react";
import { toast } from "react-hot-toast";
import GroupIcon from "../assets/img/group.svg"; // icono representativo

interface Props {
  onSesionUnida: (codigo: string) => void;
  onVolver: () => void;
}

export default function SessionJoiner({ onSesionUnida, onVolver }: Props) {
  const [codigo, setCodigo] = useState("");

  const unirse = () => {
    if (!codigo.trim()) {
      toast.error("Debe ingresar un código válido");
      return;
    }
    onSesionUnida(codigo.toUpperCase());
    toast.success("Código ingresado correctamente");
  };

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.1)]
                 p-8 sm:p-10 lg:p-12
                 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto
                 flex flex-col gap-8 border border-[#E0EDF5] transition-all duration-500"
    >
      {/* Icono grande arriba */}
      <div className="flex justify-center">
        <img src={GroupIcon} alt="Unirse" className="w-20 h-20 sm:w-24 sm:h-24" />
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034C7D] text-center">
        Unirse a sesión
      </h2>

      <p className="text-center text-gray-600 text-lg sm:text-xl max-w-lg mx-auto">
        Introduce el código de sesión proporcionado por tu docente para unirte y comenzar a colaborar.
      </p>

      <input
        type="text"
        placeholder="Código de sesión"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        className="border border-[#D0E0F0] rounded-2xl p-4 w-full bg-[#F0F7FB] text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-[#76C7F3] transition"
      />

      <button
        onClick={unirse}
        className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white font-semibold px-6 py-4 rounded-3xl
                   shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]
                   transition-transform transform hover:-translate-y-1 hover:scale-105"
      >
        Unirse
      </button>

      <p className="text-center text-gray-500 text-sm">
        Si no tienes código, pide a tu docente que cree la sesión.
      </p>

      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline mt-2 self-center"
      >
        Volver
      </button>
    </div>
  );
}
