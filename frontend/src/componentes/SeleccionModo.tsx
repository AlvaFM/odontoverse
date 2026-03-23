import { useState } from "react";
import CrearSesion from "./CrearSesion";
import IngresarSesion from "./IngresarSesion";
import TestSupabase from "./TestSupabase";

export default function SeleccionModo() {
  const [modo, setModo] = useState("");

  if (modo === "profesor") {
    return <CrearSesion />;
  }

  if (modo === "alumno") {
    return <IngresarSesion />;
  }

  if (modo === "pruebasupabase") {
    return <TestSupabase />;
  }

  return (
    <div>
      <h1>Seleccionar modo</h1>

      <button onClick={() => setModo("profesor")}>
        Profesor
      </button>

      <button onClick={() => setModo("alumno")}>
        Alumno
      </button>

      <button onClick={() => setModo("pruebasupabase")}>
        Probar Supabase
      </button>
    </div>
  );
}

