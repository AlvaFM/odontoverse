import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import VistaAlumno from "./VistaAlumno";
import dienteLike from "../assets/img/dientelike.png";
import dinoImagen from "../assets/img/dinoimagen.avif";

interface SesionData {
  codigo: string;
  activa: boolean;
  tiempo_limite: number | null;
}

interface Props {
  onVolver?: () => void;
}

export default function IngresarSesion({ onVolver }: Props) {
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
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleVolver = () => {
    window.location.reload();
  };

  const unirseASesion = async () => {
    if (!nombre.trim()) return setError("Ingresa tu nombre");
    if (!email.trim()) return setError("Ingresa tu email");
    if (!codigoSesion.trim()) return setError("Ingresa el código");

    setCargando(true);
    setError("");

    const { data, error: errorSesion } = await supabase
      .from("sesiones")
      .select("codigo, activa, tiempo_limite")
      .eq("codigo", codigoSesion.toUpperCase())
      .maybeSingle();

    if (errorSesion || !data) {
      setError("Código inválido");
      setCargando(false);
      return;
    }

    const sesion = data as SesionData;

    const { data: alumnoExistente } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sesion_codigo", codigoSesion.toUpperCase())
      .eq("email", email)
      .maybeSingle();

    let alumnoIdTemp = alumnoExistente?.id || "";

    if (!alumnoIdTemp) {
      const { data: nuevoAlumno, error } = await supabase
        .from("alumnos")
        .insert([{
          nombre: nombre.trim(),
          email: email.trim(),
          sesion_codigo: codigoSesion.toUpperCase(),
        }])
        .select()
        .single();

      if (error) {
        setError("No se pudo ingresar");
        setCargando(false);
        return;
      }

      alumnoIdTemp = nuevoAlumno.id;
    }

    setAlumnoId(alumnoIdTemp);
    setCargando(false);

    if (sesion.activa) {
      setEntrar(true);
      return;
    }

    setEsperandoInicio(true);

    pollingRef.current = window.setInterval(async () => {
      const { data: estado } = await supabase
        .from("sesiones")
        .select("activa")
        .eq("codigo", codigoSesion.toUpperCase())
        .maybeSingle();

      if (estado?.activa) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setEsperandoInicio(false);
        setEntrar(true);
      }
    }, 1000);
  };

  // Vista alumno
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

  // SALA DE ESPERA
  if (esperandoInicio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-5 relative">
          {/* Botón Volver - esquina superior izquierda */}
          <button
            onClick={handleVolver}
            className="absolute top-4 left-4 text-sm text-slate-500 hover:text-[#1e3a5f] transition flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm"
          >
            ← Volver
          </button>

          {/* ICONO */}
          <div className="w-16 h-16 mx-auto bg-[#eef6ff] rounded-2xl flex items-center justify-center animate-pulse">
            <img src={dienteLike} className="w-10 h-10 object-contain" />
          </div>

          {/* TEXTO */}
          <div>
            <h2 className="text-lg font-semibold text-[#1e3a5f]">
              Esperando inicio
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Ya estás dentro de la sesión
            </p>
          </div>

          {/* INFO */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 space-y-1">
            <p className="font-medium text-[#1e3a5f]">{nombre}</p>
            <p>{email}</p>
            <p className="tracking-widest font-semibold text-center text-[#1e3a5f]">
              {codigoSesion}
            </p>
          </div>

          {/* LOADING */}
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-[#9ecbff] border-t-transparent rounded-full animate-spin"></div>
          </div>

          <p className="text-xs text-slate-400">
            Esperando que el profesor inicie la sesión
          </p>
        </div>
      </div>
    );
  }

  // FORMULARIO
  return (
  <div className="min-h-screen flex bg-[#eef6fb]">

    {/* PANEL IZQUIERDO */}
    <div className="w-full lg:w-1/2 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 relative">

        <button
          onClick={handleVolver}
          className="absolute top-4 left-4 text-sm text-slate-500 hover:text-[#1e3a5f] transition flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm"
        >
          ← Volver
        </button>

        <div className="w-14 h-14 mx-auto bg-[#eef6ff] rounded-2xl flex items-center justify-center mb-4">
          <img
            src={dienteLike}
            alt="Logo"
            className="w-9 h-9 object-contain"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center text-[#1e3a5f] mb-2">
          Unirse a sesión
        </h2>

        <p className="text-center text-slate-500 mb-6 text-sm">
          Ingresa tus datos para participar
        </p>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl
              border border-slate-200
              focus:outline-none
              focus:ring-2
              focus:ring-[#9ecbff]
              text-sm
            "
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl
              border border-slate-200
              focus:outline-none
              focus:ring-2
              focus:ring-[#9ecbff]
              text-sm
            "
          />

          <input
            type="text"
            placeholder="Código de sesión"
            value={codigoSesion}
            onChange={(e) =>
              setCodigoSesion(e.target.value.toUpperCase())
            }
            className="
              w-full px-4 py-3 rounded-xl
              border border-slate-200
              focus:outline-none
              focus:ring-2
              focus:ring-[#9ecbff]
              text-sm text-center tracking-widest font-semibold
            "
          />

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            onClick={unirseASesion}
            disabled={cargando}
            className="
              w-full py-3 rounded-xl
              text-sm font-medium
              bg-[#9ecbff]
              text-[#1e3a5f]
              hover:bg-[#81b0d6]
              transition-all duration-200
              disabled:opacity-60
            "
          >
            {cargando ? "Verificando..." : "Ingresar"}
          </button>

        </div>
      </div>
    </div>

    {/* PANEL DERECHO */}
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">

      <img
        src={dinoImagen}
        alt="Dino"
        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#eef6fb]" />
    </div>

  </div>
);
}