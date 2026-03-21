
import { useState } from "react";
import CrearSesion from "./CrearSesion";
import IngresarSesion from "./IngresarSesion"

export default function SeleccionModo() {
  const [modo, setModo] = useState("");

  if (modo === "profesor") {
    return <CrearSesion />;
  }

  if (modo === "alumno") {
     return <IngresarSesion />;
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
    </div>
  );
}

