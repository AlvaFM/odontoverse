import { useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmarDiagnostico from "./ConfirmarDiagnostico";

interface Props {
  codigoSesion: string;
  profesorEmail: string;
  onVolver: () => void;
}

export default function SubirCaso({ codigoSesion, profesorEmail, onVolver }: Props) {
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

    const { error: dbError } = await supabase.from("casos_clinicos").insert([{
      sesion_codigo: codigoSesion,
      imagen_url: "pendiente",
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
        onVolver={onVolver}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Subir imagen clínica</h2>
          <button
            onClick={onVolver}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            ← Volver
          </button>
        </div>

        <p className="text-slate-600 mb-4">
          <span className="font-medium">Sesión:</span> {codigoSesion}
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setImagen(e.target.files[0]);
            }
          }}
          className="w-full px-4 py-2 rounded-xl bg-[#f7fbfd] border border-[#cfeaf6] mb-4"
        />

        <button
          onClick={enviarImagen}
          disabled={subiendo || !imagen}
          className="w-full py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50"
        >
          {subiendo ? "Analizando..." : "🔍 Analizar imagen"}
        </button>

        {error && <p className="text-red-500 mt-3 text-sm text-center">{error}</p>}

        {analizado && (
          <div className="mt-6 text-center space-y-3">
            <div className="bg-[#f0f8ff] rounded-xl p-4">
              <p className="text-sm text-slate-500">Diagnóstico del modelo</p>
              <p className="font-semibold text-[#1e3a5f]">{diagnostico}</p>
            </div>

            <div className="bg-[#f0f8ff] rounded-xl p-4">
              <p className="text-sm text-slate-500">Confianza</p>
              <p className="font-semibold text-[#1e3a5f]">{confianza}%</p>
            </div>

            <button
              onClick={() => setContinuar(true)}
              className="w-full py-3 rounded-xl bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2] transition"
            >
              Confirmar diagnóstico
            </button>
          </div>
        )}
      </div>
    </div>
  );
}