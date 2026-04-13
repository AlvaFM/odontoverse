import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import VistaAlumno from "./VistaAlumno";

interface SesionData {
  codigo: string;
  activa: boolean;
  tiempo_limite: number | null;
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

    // 1. Verificar si la sesión existe
    const { data, error: errorSesion } = await supabase
      .from("sesiones")
      .select("codigo, activa, tiempo_limite")
      .eq("codigo", codigoSesion.toUpperCase())
      .maybeSingle();

    if (errorSesion) {
      console.error("Error al verificar sesión:", errorSesion);
      setError("Error al verificar la sesión");
      setCargando(false);
      return;
    }

    if (!data) {
      setError("Código de sesión inválido");
      setCargando(false);
      return;
    }

    const sesion = data as SesionData;

    // 2. Verificar si el alumno ya está registrado
    const { data: alumnoExistente } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sesion_codigo", codigoSesion.toUpperCase())
      .eq("email", email)
      .maybeSingle();

    let alumnoIdTemp: string = alumnoExistente?.id || "";

    // 3. Registrar al alumno SIEMPRE
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
        console.error("Error al registrar alumno:", errorAlumno);
        setError("Error al unirse a la sesión: " + errorAlumno.message);
        setCargando(false);
        return;
      }

      alumnoIdTemp = nuevoAlumno.id;
    }

    setAlumnoId(alumnoIdTemp);
    setCargando(false);

    // 4. Si la sesión está activa, entrar directamente
    if (sesion.activa === true) {
      setEntrar(true);
      return;
    }

    // 5. Si la sesión no está activa, mostrar sala de espera con POLLING
    if (sesion.activa === false) {
      setEsperandoInicio(true);
      
      // POLLING: cada 1 segundo verificar si la sesión se activa
      pollingRef.current = window.setInterval(async () => {
        try {
          const { data: estadoData, error: pollingError } = await supabase
            .from("sesiones")
            .select("activa")
            .eq("codigo", codigoSesion.toUpperCase())
            .maybeSingle();
          
          if (pollingError) {
            console.error("Error en polling:", pollingError);
            return;
          }
          
          if (estadoData && estadoData.activa === true) {
            console.log("¡Sesión activa detectada! Redirigiendo...");
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
            // IMPORTANTE: Cambiar ambos estados
            setEsperandoInicio(false);
            setEntrar(true);
          }
        } catch (err) {
          console.error("Error en polling:", err);
        }
      }, 1000);
      
      return;
    }
  };

  // Entrar al cuestionario (primera prioridad)
  if (entrar && alumnoId) {
    return (
      <VistaAlumno
        nombre={nombre}
        email={email}
        codigoSesion={codigoSesion.toUpperCase()}
        alumnoId={alumnoId}
      />
    );
  }

  // Sala de espera
  if (esperandoInicio) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⏳ Sala de espera</h2>
        <p><strong>{nombre}</strong>, ya estás registrado en la sesión.</p>
        <p><strong>Código:</strong> {codigoSesion}</p>
        <p><strong>Email:</strong> {email}</p>
        <p>El profesor <strong>iniciará el cuestionario en breve</strong>.</p>
        <p>No cierres esta ventana. Verificando cada 1 segundo...</p>
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

  // Formulario de ingreso
  return (
  <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">

    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">

      {/* TITULO */}
      <h2 className="text-xl font-semibold text-[#1e3a5f] text-center mb-6">
        Ingresar a sesión clínica
      </h2>

      {/* INPUTS */}
      <div className="space-y-3">

        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#f7fbfd] border border-[#d6eaf3] focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#f7fbfd] border border-[#d6eaf3] focus:outline-none focus:ring-2 focus:ring-[#9ecbff]"
        />

        <input
          type="text"
          placeholder="Código de sesión"
          value={codigoSesion}
          onChange={(e) => setCodigoSesion(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 rounded-xl bg-[#f7fbfd] border border-[#d6eaf3] focus:outline-none focus:ring-2 focus:ring-[#9ecbff] tracking-widest text-center font-semibold"
        />
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      {/* BOTÓN */}
      <button
        onClick={unirseASesion}
        disabled={cargando}
        className="mt-5 w-full py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50"
      >
        {cargando ? "Verificando..." : "Unirse a sesión"}
      </button>
    </div>
  </div>
  );
}