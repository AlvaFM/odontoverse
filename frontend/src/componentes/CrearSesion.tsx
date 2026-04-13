import { useState } from "react";
import { supabase } from "../lib/supabase";
import SubirCaso from "./SubirCaso";

interface Props {
  profesorEmail: string | null;
  onVolver: () => void;
}

export default function CrearSesion({ profesorEmail, onVolver }: Props) {
  const [codigoSesion, setCodigoSesion] = useState("");
  const [continuar, setContinuar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const generarCodigo = async () => {
    if (!profesorEmail) {
      setError("No hay sesión de profesor activa");
      return;
    }

    setCargando(true);
    setError("");

    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error: dbError } = await supabase.from("sesiones").insert([{
      codigo: codigo,
      profesor_email: profesorEmail,
      activa: false,
      creada_en: new Date().toISOString(),
    }]);

    if (dbError) {
      console.error("Error al guardar:", dbError);
      setError("Error al crear la sesión: " + dbError.message);
      setCargando(false);
      return;
    }
    
    setCodigoSesion(codigo);
    setCargando(false);
  };

  if (continuar) {
    return <SubirCaso codigoSesion={codigoSesion} profesorEmail={profesorEmail || ""} onVolver={onVolver} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Crear sesión clínica</h2>
          <button onClick={onVolver} className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition">← Volver</button>
        </div>

        <p className="text-slate-600 mb-4"><span className="font-medium">Profesor:</span> {profesorEmail}</p>

        <button onClick={generarCodigo} disabled={cargando} className="w-full py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50">
          {cargando ? "Generando..." : "Generar código"}
        </button>

        {error && <p className="text-red-500 mt-3 text-sm text-center">{error}</p>}

        {codigoSesion && (
          <div className="mt-5 text-center">
            <p className="text-slate-700"><span className="font-medium">Código sesión:</span></p>
            <p className="text-2xl font-bold tracking-widest text-[#1e3a5f] mt-1">{codigoSesion}</p>
            <button onClick={() => setContinuar(true)} className="mt-4 w-full py-3 rounded-xl bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2] transition">Continuar</button>
          </div>
        )}
      </div>
    </div>
  );
}