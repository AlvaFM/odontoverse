import { useState } from "react";

interface Props {
  onSesionUnida: (codigo: string) => void;
  onVolver: () => void;
}

export default function SessionJoiner({ onSesionUnida, onVolver }: Props) {
  const [codigo, setCodigo] = useState("");

  const unirse = () => {
    if (!codigo) return alert("Debe ingresar un código válido");
    onSesionUnida(codigo.toUpperCase());
  };

  return (
    <div className="bg-[#D6E6F2] border border-[#E0E0E0] shadow-md rounded-2xl p-6 w-96 text-center">
      <h2 className="text-2xl font-semibold mb-4 text-[#034C7D]">Unirse a sesión</h2>

      <input
        type="text"
        placeholder="Código de sesión"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        className="border border-[#E0E0E0] rounded-lg p-2 w-full mb-3 bg-white text-gray-800"
      />

      <button
        onClick={unirse}
        className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-4 py-2 rounded-lg w-full mb-2"
      >
        Unirse
      </button>

      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline"
      >
        Volver
      </button>
    </div>
  );
}
