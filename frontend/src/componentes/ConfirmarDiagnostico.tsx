import { useState } from "react";
import { supabase } from "../lib/supabase";
import ConfigurarSesion from "./ConfigurarSesion";

interface Props {
  codigoSesion: string;
  diagnostico: string;
  confianza: number;
  profesorEmail: string;
}

export default function ConfirmarDiagnostico({
  codigoSesion,
  diagnostico,
  confianza,
  profesorEmail,
}: Props) {
  const [continuar, setContinuar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const aprobarDiagnostico = async () => {
    setGuardando(true);

    const { error } = await supabase
      .from("casos_clinicos")
      .update({ diagnostico_aprobado: true })
      .eq("sesion_codigo", codigoSesion)
      .eq("diagnostico_ml", diagnostico);

    if (error) {
      console.error(error);
      alert("Error al guardar el diagnóstico aprobado");
      setGuardando(false);
      return;
    }

    setGuardando(false);
    setContinuar(true);
  };

  if (continuar) {
    return (
      <ConfigurarSesion
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
        profesorEmail={profesorEmail}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">

        {/* HEADER */}
        <h2 className="text-xl font-semibold text-[#1e3a5f] text-center mb-6">
          Confirmar diagnóstico
        </h2>

        {/* SESIÓN */}
        <div className="bg-[#f0f8ff] rounded-xl p-3 mb-5 text-center">
          <p className="text-sm text-slate-500">Sesión activa</p>
          <p className="font-semibold text-[#1e3a5f]">{codigoSesion}</p>
        </div>

        {/* DIAGNÓSTICO */}
        <div className="space-y-3 mb-6">

          <div className="bg-[#f0f8ff] rounded-xl p-4 text-center">
            <p className="text-sm text-slate-500">Diagnóstico IA</p>
            <p className="font-semibold text-[#1e3a5f]">
              {diagnostico}
            </p>
          </div>

          <div className="bg-[#f0f8ff] rounded-xl p-4 text-center">
            <p className="text-sm text-slate-500">Confianza</p>
            <p className="font-semibold text-[#1e3a5f]">
              {confianza}%
            </p>
          </div>

        </div>

        {/* BOTÓN */}
        <button
          onClick={aprobarDiagnostico}
          disabled={guardando}
          className="
            w-full py-3 rounded-xl text-sm font-medium
            bg-[#9ecbff] text-[#1e3a5f]
            hover:bg-[#81b0d6]
            transition-all duration-200
            disabled:opacity-50
          "
        >
          {guardando ? "Guardando..." : "Aprobar y continuar"}
        </button>

      </div>
    </div>
  );
}