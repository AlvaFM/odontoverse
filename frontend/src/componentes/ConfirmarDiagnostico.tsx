
import { useState } from "react";
import ConfigurarSesion from "./ConfigurarSesion";

interface Props {
  codigoSesion: string;
  diagnostico: string;
  confianza: number;
}

export default function ConfirmarDiagnostico({
  codigoSesion,
  diagnostico,
  confianza,
}: Props) {
  const [continuar, setContinuar] = useState(false);

  if (continuar) {
    return (
      <ConfigurarSesion
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
      />
    );
  }

  return (
    <div>
      <h2>Confirmar diagnóstico</h2>

      <p>Sesión: {codigoSesion}</p>
      <p>Diagnóstico real: {diagnostico}</p>
      <p>Confianza: {confianza}%</p>

      <button onClick={() => setContinuar(true)}>
        Aprobar y continuar
      </button>
    </div>
  );
}

