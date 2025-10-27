import { useState } from "react";
import UploadCase from "./UploadCase";

interface Props {
  onSesionCreada: (codigo: string, file?: File | null) => void;
  onVolver: () => void;
}

export default function SessionCreator({ onSesionCreada, onVolver }: Props) {
  const [caso, setCaso] = useState("");
  const [tiempo, setTiempo] = useState<number>(10);
  const [codigo, setCodigo] = useState<string>("");
  const [radiografia, setRadiografia] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const generarCodigo = () => {
    const nuevoCodigo = Math.random().toString(36).substring(2, 7).toUpperCase();
    setCodigo(nuevoCodigo);
    return nuevoCodigo;
  };

  const crearSesion = () => {
    if (!caso || !radiografia) {
      alert("Debes ingresar el nombre del caso y subir una radiografía.");
      return;
    }
    const codigoFinal = codigo || generarCodigo();
    onSesionCreada(codigoFinal, radiografia);
  };

  const handleUpload = (file: File) => {
    setSubiendo(true);
    setTimeout(() => {
      setRadiografia(file);
      setSubiendo(false);
    }, 500); // simulación
  };

  const handleRemoveFile = () => {
    setRadiografia(null);
  };

  return (
    <div className="bg-[#D6E6F2] border border-[#E0E0E0] shadow-md rounded-2xl p-6 w-[26rem] text-center">
      <h2 className="text-2xl font-semibold mb-4 text-[#034C7D]">Crear sesión</h2>

      <div className="space-y-3 text-left">
        <label className="text-sm font-medium text-[#034C7D]">Nombre del caso</label>
        <input
          type="text"
          placeholder="Ej: Caries Molar Superior"
          value={caso}
          onChange={(e) => setCaso(e.target.value)}
          className="border border-[#E0E0E0] rounded-lg p-2 w-full mb-3 bg-white text-gray-800"
        />

        <label className="text-sm font-medium text-[#034C7D]">Tiempo (minutos)</label>
        <input
          type="number"
          placeholder="Duración"
          value={tiempo}
          onChange={(e) => setTiempo(parseInt(e.target.value))}
          className="border border-[#E0E0E0] rounded-lg p-2 w-full mb-3 bg-white text-gray-800"
        />
      </div>

      <div className="mt-4">
        <UploadCase
          onUpload={handleUpload}
          selectedFile={radiografia}
          onRemoveFile={handleRemoveFile}
          isUploading={subiendo}
        />
      </div>

      {codigo && (
        <p className="mt-3 text-sm text-[#034C7D]">
          Código generado: <b>{codigo}</b>
        </p>
      )}

      <button
        onClick={crearSesion}
        className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-4 py-2 rounded-lg w-full mt-4"
      >
        Crear sesión
      </button>

      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline mt-3"
      >
        Volver
      </button>
    </div>
  );
}
