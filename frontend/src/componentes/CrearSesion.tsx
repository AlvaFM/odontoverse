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
      estado: "configurando",
      creada_en: new Date().toISOString(),
      activa: true
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
    return <SubirCaso codigoSesion={codigoSesion} profesorEmail={profesorEmail || ""} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 w-full max-w-md">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Crear sesión clínica
          </h2>

          <button
            onClick={onVolver}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            ← Volver
          </button>
        </div>

        {/* Info profesor */}
        <p className="text-slate-600 mb-4">
          <span className="font-medium">Profesor:</span> {profesorEmail}
        </p>

        {/* Botón generar */}
        <button
          onClick={generarCodigo}
          disabled={cargando}
          className="w-full bg-sky-300 hover:bg-sky-400 text-slate-800 py-3 rounded-xl transition-all duration-200 shadow-sm"
        >
          {cargando ? "Generando..." : "Generar código"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-3 text-sm">{error}</p>
        )}

        {/* Código generado */}
        {codigoSesion && (
          <div className="mt-5 text-center">
            <p className="text-slate-700">
              <span className="font-medium">Código sesión:</span>
            </p>

            <p className="text-2xl font-bold tracking-widest text-sky-600 mt-1">
              {codigoSesion}
            </p>

            <button
              onClick={() => setContinuar(true)}
              className="mt-4 w-full bg-cyan-200 hover:bg-cyan-300 text-slate-800 py-3 rounded-xl transition-all duration-200 shadow-sm"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}