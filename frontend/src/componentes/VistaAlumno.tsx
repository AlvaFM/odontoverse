import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import VistaAlumno from "./VistaAlumno";

interface Sesion {
  codigo: string;
  estado: string;
  tiempo_límite: number | null;
}

export default function IngresarSesion() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [codigoSesion, setCodigoSesion] = useState<string>("");
  const [entrar, setEntrar] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string>("");
  const [esperandoInicio, setEsperandoInicio] = useState<boolean>(false);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const unirseASesion = async () => {
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

    const { data, error: errorSesion } = await supabase
      .from("sesiones")
      .select("codigo, estado, tiempo_límite")
      .eq("codigo", codigoSesion.toUpperCase())
      .maybeSingle();

    if (errorSesion) {
      setError("Error al verificar sesión");
      setCargando(false);
      return;
    }

    const sesion = data as Sesion | null;

    if (!sesion) {
      setError("Código de sesión inválido");
      setCargando(false);
      return;
    }

    if (sesion.estado === "finalizada") {
      setError("Esta sesión ya finalizó.");
      setCargando(false);
      return;
    }

    const { data: alumnoExistente } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sesion_codigo", codigoSesion.toUpperCase())
      .eq("email", email)
      .maybeSingle();

    let alumnoIdTemp: string = alumnoExistente?.id || "";

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

    if (sesion.estado === "activa") {
      if (alumnoIdTemp) {
        setEntrar(true);
      }
      return;
    }

    if (sesion.estado === "configurando") {
      setEsperandoInicio(true);
      
      pollingRef.current = window.setInterval(async () => {
        const { data: sesionActualData } = await supabase
          .from("sesiones")
          .select("estado")
          .eq("codigo", codigoSesion.toUpperCase())
          .maybeSingle();
        
        const sesionActual = sesionActualData as { estado: string } | null;
        
        if (sesionActual?.estado === "activa") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          if (alumnoIdTemp) {
            setEntrar(true);
          }
        }
      }, 2000);
      
      return;
    }
  };

  if (esperandoInicio) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⏳ Sala de espera</h2>
        <p><strong>{nombre}</strong>, ya estás registrado en la sesión.</p>
        <p>El profesor <strong>iniciará el cuestionario en breve</strong>.</p>
        <p>No cierres esta ventana. Verificando cada 2 segundos...</p>
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

  if (entrar && alumnoId) {
    return (
      <VistaAlumno
        nombre={nombre as string} 
        email={email as string}
        codigoSesion={codigoSesion.toUpperCase() as string}
        alumnoId={alumnoId as string}
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