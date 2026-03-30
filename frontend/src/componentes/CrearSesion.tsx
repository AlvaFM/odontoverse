import { useState } from "react";
import { supabase } from "../lib/supabase";
import SubirCaso from "./SubirCaso";

interface Props {
  profesorEmail: string | null;
  onVolver: () => void;  // ← Cambiado: onLogout → onVolver
}

export default function CrearSesion({ profesorEmail, onVolver }: Props) {  // ← Cambiado
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
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Crear sesión clínica</h2>
        <button onClick={onVolver} style={{ backgroundColor: "#ccc" }}>  {/* ← Cambiado */}
          ← Volver al panel
        </button>
      </div>

      <p><strong>Profesor:</strong> {profesorEmail}</p>

      <button 
        onClick={generarCodigo} 
        disabled={cargando}
      >
        {cargando ? "Generando..." : "Generar código"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {codigoSesion && (
        <>
          <p style={{ marginTop: "1rem" }}>
            <strong>Código sesión:</strong> {codigoSesion}
          </p>

          <button onClick={() => setContinuar(true)}>
            Continuar
          </button>
        </>
      )}
    </div>
  );
}