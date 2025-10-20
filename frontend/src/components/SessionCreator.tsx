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
    <div className="bg-white shadow-md rounded-xl p-6 w-[26rem] text-center">
      <h2 className="text-2xl font-semibold mb-4">Crear Sesión</h2>

      <div className="space-y-3 text-left">
        <label className="text-sm font-medium text-gray-700">Nombre del caso</label>
        <input
          type="text"
          placeholder="Ej: Caries Molar Superior"
          value={caso}
          onChange={(e) => setCaso(e.target.value)}
          className="border rounded-lg p-2 w-full mb-3"
        />

        <label className="text-sm font-medium text-gray-700">Tiempo (minutos)</label>
        <input
          type="number"
          placeholder="Duración"
          value={tiempo}
          onChange={(e) => setTiempo(parseInt(e.target.value))}
          className="border rounded-lg p-2 w-full mb-3"
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
        <p className="mt-3 text-sm text-gray-600">
          Código generado: <b>{codigo}</b>
        </p>
      )}

      <button
        onClick={crearSesion}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full mt-4"
      >
        Crear Sesión
      </button>

      <button onClick={onVolver} className="text-gray-600 text-sm underline mt-3">
        Volver
      </button>
    </div>
  );
}
