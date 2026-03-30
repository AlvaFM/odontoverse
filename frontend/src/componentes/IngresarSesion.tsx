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
  const [esperandoInicio, setEsperandoInicio] = useState(false);

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

    // 1. Verificar si la sesión existe
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

    // 2. Verificar el estado de la sesión
    if (sesion.estado === "finalizada") {
      setError("Esta sesión ya finalizó.");
      setCargando(false);
      return;
    }

    // 3. Verificar si el alumno ya está registrado
    const { data: alumnoExistente } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sesion_codigo", codigoSesion.toUpperCase())
      .eq("email", email)
      .single();

    let alumnoIdTemp = alumnoExistente?.id;

    // 4. Si no existe, registrar al alumno
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

    // 5. Si la sesión está configurando, mostrar mensaje de espera
    if (sesion.estado === "configurando") {
      setEsperandoInicio(true);
      
      // Suscribirse a cambios en la sesión
      const subscription = supabase
        .channel(`sesion_${codigoSesion}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "sesiones",
            filter: `codigo=eq.${codigoSesion.toUpperCase()}`,
          },
          (payload) => {
            if (payload.new.estado === "activa") {
              subscription.unsubscribe();
              setEntrar(true);
            }
          }
        )
        .subscribe();
        
      return;
    }

    // 6. Si está activa, entrar directamente
    if (sesion.estado === "activa") {
      setEntrar(true);
    }
  };

  if (esperandoInicio) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⏳ Sala de espera</h2>
        <p><strong>{nombre}</strong>, ya estás registrado en la sesión.</p>
        <p>El profesor <strong>iniciará el cuestionario en breve</strong>.</p>
        <p>No cierres esta ventana.</p>
        <div style={{ marginTop: "20px" }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
    <div style={{ padding: "1rem" }}>
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