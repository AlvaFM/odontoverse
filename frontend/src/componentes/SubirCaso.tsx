
import { useState } from "react";
import ConfirmarDiagnostico from "./ConfirmarDiagnostico";

interface Props {
  codigoSesion: string;
}

export default function SubirCaso({ codigoSesion }: Props) {
  const [imagen, setImagen] = useState<File | null>(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [confianza, setConfianza] = useState(0);
  const [analizado, setAnalizado] = useState(false);
  const [continuar, setContinuar] = useState(false);

  const enviarImagen = async () => {
    if (!imagen) return;

    const formData = new FormData();
    formData.append("file", imagen);

    const respuesta = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      body: formData,
    });

    const data = await respuesta.json();

    const diagnosticoReal =
      data.prediction ||
      data.diagnostico ||
      data.resultado ||
      "Diagnóstico no disponible";

    const confianzaReal =
      data.confidence ||
      data.confianza ||
      data.porcentaje ||
      0;

    setDiagnostico(diagnosticoReal);
    setConfianza(confianzaReal);
    setAnalizado(true);
  };

  if (continuar) {
    return (
      <ConfirmarDiagnostico
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
        confianza={confianza}
      />
    );
  }

  return (
    <div>
      <h2>Subir imagen clínica</h2>

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setImagen(e.target.files[0]);
          }
        }}
      />

      <button onClick={enviarImagen}>
        Analizar imagen
      </button>

      {analizado && (
        <>
          <hr />

          <h3>Resultado del análisis</h3>
          <p>Diagnóstico real del modelo: {diagnostico}</p>
          <p>Confianza: {confianza}%</p>

          <button onClick={() => setContinuar(true)}>
            Confirmar diagnóstico
          </button>
        </>
      )}
    </div>
  );
}

