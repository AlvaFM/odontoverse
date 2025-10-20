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
    <div className="bg-white shadow-md rounded-xl p-6 w-96 text-center">
      <h2 className="text-2xl font-semibold mb-4">Unirse a Sesión</h2>
      <input
        type="text"
        placeholder="Código de sesión"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        className="border rounded-lg p-2 w-full mb-3"
      />
      <button onClick={unirse} className="bg-green-600 text-white px-4 py-2 rounded-lg w-full mb-2">
        Unirse
      </button>
      <button onClick={onVolver} className="text-gray-600 text-sm underline">
        Volver
      </button>
    </div>
  );
}
