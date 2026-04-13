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
  const [animando, setAnimando] = useState(false);

  const generarCodigo = async () => {
    if (!profesorEmail) {
      setError("No hay sesión de profesor activa");
      return;
    }

    setCargando(true);
    setError("");

    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error: dbError } = await supabase.from("sesiones").insert([
      {
        codigo: codigo,
        profesor_email: profesorEmail,
        activa: false,
        creada_en: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      setError("Error al crear la sesión: " + dbError.message);
      setCargando(false);
      return;
    }

    setCodigoSesion(codigo);
    setCargando(false);
  };

  const irAContinuar = () => {
    setAnimando(true);
    setTimeout(() => {
      setContinuar(true);
    }, 180);
  };

  const volverAnimado = () => {
    setAnimando(true);
    setTimeout(() => {
      onVolver();
    }, 180);
  };

  if (continuar) {
    return (
      <SubirCaso
        codigoSesion={codigoSesion}
        profesorEmail={profesorEmail || ""}
        onVolver={onVolver}
      />
    );
  }

  return (
    <div
      className={`h-screen w-screen flex flex-col items-center justify-center bg-slate-100 transition-all duration-300 ${
        animando ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-700">
          Crear sesión clínica
        </h1>
        <p className="text-slate-500 mt-2 text-base md:text-lg">
          Genera un código para comenzar
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={volverAnimado}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            ← Volver
          </button>

          <span className="text-sm text-slate-500">
            {profesorEmail}
          </span>
        </div>

        <button
          onClick={generarCodigo}
          disabled={cargando}
          className="w-full py-3 rounded-xl bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2] transition disabled:opacity-50"
        >
          {cargando ? "Generando..." : "Generar código"}
        </button>

        {error && (
          <p className="text-red-500 mt-3 text-sm text-center">{error}</p>
        )}

        {codigoSesion && (
          <div className="mt-6 text-center">
            <p className="text-slate-600 font-medium">Código sesión</p>

            <p className="text-3xl font-bold tracking-widest text-[#1e3a5f] mt-2">
              {codigoSesion}
            </p>

            <button
              onClick={irAContinuar}
              className="mt-5 w-full py-3 rounded-xl bg-[#dcebf7] text-[#1e3a5f] hover:bg-[#cfe3f3] transition"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}