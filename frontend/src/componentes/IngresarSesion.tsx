import { useState } from "react";
import { supabase } from "../lib/supabase";
import VistaAlumno from "./VistaAlumno";

export default function IngresarSesion() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [codigoSesion, setCodigoSesion] = useState("");
  const [entrar, setEntrar] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [alumnoId, setAlumnoId] = useState<string>("");

  const unirseASesion = async () => {
    // Validaciones básicas
    if (!nombre.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa tu email");
      return;
    }
    if (!codigoSesion.trim()) {
      setError("Ingresa el código de sesión");
      return;
    }

    setCargando(true);
    setError("");

    // 1. Verificar si la sesión existe y está activa
    const { data: sesion, error: errorSesion } = await supabase
      .from("sesiones")
      .select("codigo, estado, tiempo_limite")
      .eq("codigo", codigoSesion.toUpperCase())
      .single();

    if (errorSesion || !sesion) {
      setError("Código de sesión inválido");
      setCargando(false);
      return;
    }

    if (sesion.estado !== "activa") {
      if (sesion.estado === "configurando") {
        setError("La sesión aún no ha comenzado. Espera a que el profesor la inicie.");
      } else if (sesion.estado === "finalizada") {
        setError("Esta sesión ya finalizó.");
      } else {
        setError("La sesión no está disponible.");
      }
      setCargando(false);
      return;
    }

    // 2. Verificar si el alumno ya está registrado
    const { data: alumnoExistente } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sesion_codigo", codigoSesion.toUpperCase())
      .eq("email", email)
      .single();

    let alumnoIdTemp = alumnoExistente?.id;

    // 3. Si no existe, registrar al alumno
    if (!alumnoIdTemp) {
      const { data: nuevoAlumno, error: errorAlumno } = await supabase
        .from("alumnos")
        .insert([{
          nombre: nombre.trim(),
          email: email.trim(),
          sesion_codigo: codigoSesion.toUpperCase(),
        }])
        .select()
        .single();

      if (errorAlumno) {
        setError("Error al unirse a la sesión: " + errorAlumno.message);
        setCargando(false);
        return;
      }

      alumnoIdTemp = nuevoAlumno.id;
    }

    setAlumnoId(alumnoIdTemp);
    setCargando(false);
    setEntrar(true);
  };

  if (entrar) {
    return (
      <VistaAlumno
        nombre={nombre}
        email={email}
        codigoSesion={codigoSesion.toUpperCase()}
        alumnoId={alumnoId}
      />
    );
  }

  return (
    <div>
      <h2>Ingresar a sesión clínica</h2>

      <input
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "250px" }}
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "250px" }}
      />

      <input
        type="text"
        placeholder="Código de sesión"
        value={codigoSesion}
        onChange={(e) => setCodigoSesion(e.target.value.toUpperCase())}
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "250px" }}
      />

      {error && <p style={{ color: "red", margin: "10px 0" }}>{error}</p>}

      <button onClick={unirseASesion} disabled={cargando}>
        {cargando ? "Verificando..." : "Unirse a sesión"}
      </button>
    </div>
  );
}