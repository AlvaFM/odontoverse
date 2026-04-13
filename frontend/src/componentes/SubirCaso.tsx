import { useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmarDiagnostico from "./ConfirmarDiagnostico";

interface Props {
  codigoSesion: string;
  profesorEmail: string;
}

export default function SubirCaso({ codigoSesion, profesorEmail }: Props) {
  const [imagen, setImagen] = useState<File | null>(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [confianza, setConfianza] = useState(0);
  const [analizado, setAnalizado] = useState(false);
  const [continuar, setContinuar] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const enviarImagen = async () => {
    if (!imagen) return;
    
    setSubiendo(true);
    setError("");

    // 1. Llamar al modelo ML
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

    // 2. Guardar SOLO el diagnóstico en Supabase (sin imagen)
    const { error: dbError } = await supabase.from("casos_clinicos").insert([{
      sesion_codigo: codigoSesion,
      imagen_url: "pendiente",  // Temporal, después se actualizará
      diagnostico_ml: diagnosticoReal,
      diagnostico_aprobado: false,
    }]);

    if (dbError) {
      console.error("Error al guardar diagnóstico:", dbError);
      setError("Error al guardar el diagnóstico: " + dbError.message);
      setSubiendo(false);
      return;
    }

    setDiagnostico(diagnosticoReal);
    setConfianza(confianzaReal);
    setAnalizado(true);
    setSubiendo(false);
  };

  if (continuar) {
    return (
      <ConfirmarDiagnostico
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
        confianza={confianza}
        profesorEmail={profesorEmail}
      />
    );
  }

  return (
    <div>
      <h2>Subir imagen clínica</h2>
      <p><strong>Sesión:</strong> {codigoSesion}</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            setImagen(e.target.files[0]);
          }
        }}
      />

      <br /><br />

      <button onClick={enviarImagen} disabled={subiendo || !imagen}>
        {subiendo ? "Analizando..." : "🔍 Analizar imagen"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {analizado && (
        <>
          <hr />
          <h3>✅ Resultado del análisis</h3>
          <p><strong>Diagnóstico del modelo:</strong> {diagnostico}</p>
          <p><strong>Confianza:</strong> {confianza}%</p>

          <button onClick={() => setContinuar(true)}>
            Confirmar diagnóstico
          </button>
        </>
      )}
    </div>
  );
}

