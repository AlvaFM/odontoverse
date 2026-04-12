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
      console.error("Error al aprobar diagnóstico:", error);
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
    <div>
      <h2>Confirmar diagnóstico</h2>

      <p><strong>Sesión:</strong> {codigoSesion}</p>
      <p><strong>Diagnóstico del modelo:</strong> {diagnostico}</p>
      <p><strong>Confianza:</strong> {confianza}%</p>

      <button onClick={aprobarDiagnostico} disabled={guardando}>
        {guardando ? "Guardando..." : "✅ Aprobar y continuar"}
      </button>
    </div>
  );
}