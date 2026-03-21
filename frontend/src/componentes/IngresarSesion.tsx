
import { useState } from "react";
import VistaAlumno from "./VistaAlumno";

export default function IngresarSesion() {
  const [nombre, setNombre] = useState("");
  const [codigoSesion, setCodigoSesion] = useState("");
  const [entrar, setEntrar] = useState(false);

  if (entrar) {
    return (
      <VistaAlumno
        nombre={nombre}
        codigoSesion={codigoSesion}
      />
    );
  }

  return (
    <div>
      <h2>Ingresar a sesión clínica</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Código sesión"
        value={codigoSesion}
        onChange={(e) => setCodigoSesion(e.target.value)}
      />

      <br /><br />

      <button onClick={() => setEntrar(true)}>
        Unirse a sesión
      </button>
    </div>
  );
}

