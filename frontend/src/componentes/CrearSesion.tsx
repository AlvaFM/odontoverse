import { useState } from "react";
import SubirCaso from "./SubirCaso";

export default function CrearSesion() {
  const [codigoSesion, setCodigoSesion] = useState("");
  const [continuar, setContinuar] = useState(false);

  const generarCodigo = () => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCodigoSesion(codigo);
  };

  if (continuar) {
    return <SubirCaso codigoSesion={codigoSesion} />;
  }

  return (
    <div>
      <h2>Crear sesión clínica</h2>

      <button onClick={generarCodigo}>
        Generar código
      </button>

      {codigoSesion && (
        <>
          <p>Código sesión: {codigoSesion}</p>

          <button onClick={() => setContinuar(true)}>
            Continuar
          </button>
        </>
      )}
    </div>
  );
}

