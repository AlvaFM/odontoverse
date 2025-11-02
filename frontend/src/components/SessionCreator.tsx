import { useState } from "react";
import UploadCase from "./UploadCase";
import { showCustomToast } from "./CustomToast";
import DienteIcon from "../assets/img/dientelupa.png";

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
      showCustomToast("Debes ingresar el nombre del caso y subir una radiografía.", DienteIcon);
      return;
    }
    const codigoFinal = codigo || generarCodigo();
    onSesionCreada(codigoFinal, radiografia);
    showCustomToast("Sesión creada correctamente", DienteIcon);
  };

  const handleUpload = (file: File) => {
    setSubiendo(true);
    setTimeout(() => {
      setRadiografia(file);
      setSubiendo(false);
      showCustomToast("Radiografía cargada", DienteIcon);
    }, 500); // simulación
  };

  const handleRemoveFile = () => {
    setRadiografia(null);
    showCustomToast("Radiografía eliminada", DienteIcon);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                    p-8 sm:p-10 lg:p-12
                    max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl
                    mx-auto flex flex-col gap-6 border border-[#E0EDF5] transition-all duration-500">

      <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#034C7D]">
        Crear sesión
      </h2>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <label className="text-sm font-semibold text-[#034C7D]">Nombre del caso</label>
          <input
            type="text"
            placeholder="Ej: Caries Molar Superior"
            value={caso}
            onChange={(e) => setCaso(e.target.value)}
            className="border border-[#E0E0E0] rounded-xl p-3 bg-[#F0F7FB] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#76C7F3] transition"
          />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <label className="text-sm font-semibold text-[#034C7D]">Tiempo (minutos)</label>
          <input
            type="number"
            placeholder="Duración"
            value={tiempo}
            onChange={(e) => setTiempo(parseInt(e.target.value))}
            className="border border-[#E0E0E0] rounded-xl p-3 bg-[#F0F7FB] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#76C7F3] transition"
          />
        </div>
      </div>

      <UploadCase
        onUpload={handleUpload}
        selectedFile={radiografia}
        onRemoveFile={handleRemoveFile}
        isUploading={subiendo}
      />

      {codigo && (
        <p className="mt-2 text-center text-sm text-[#034C7D]">
          Código generado: <b>{codigo}</b>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={crearSesion}
          className="flex-1 bg-[#76C7F3] hover:bg-[#5AB0E1] text-white font-semibold px-6 py-4 rounded-3xl shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
        >
          Crear sesión
        </button>
        <button
          onClick={onVolver}
          className="flex-1 bg-[#F0F7FB] hover:bg-[#E0F0FA] text-[#034C7D] font-semibold px-6 py-4 rounded-3xl border border-[#D0D0D0] transition-transform transform hover:-translate-y-1 hover:scale-105"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
