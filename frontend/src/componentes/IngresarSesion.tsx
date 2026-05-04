import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import VistaAlumno from "./VistaAlumno";
import dienteLike from "../assets/img/dientelike.png";

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
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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

  // SALA DE ESPERA (🔥 nueva versión limpia)
  if (esperandoInicio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef6fb] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-5">

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
    <div className="min-h-screen flex items-center justify-center bg-[#eef6fb] px-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-5">

        {/* ICONO */}
        <div className="w-14 h-14 mx-auto bg-[#eef6ff] rounded-2xl flex items-center justify-center">
          <img src={dienteLike} className="w-9 h-9 object-contain" />
        </div>

        {/* TITULO */}
        <h2 className="text-lg font-semibold text-[#1e3a5f] text-center">
          Unirse a sesión
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
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* BOTÓN */}
        <button
          onClick={unirseASesion}
          disabled={cargando}
          className="w-full py-3 rounded-2xl bg-[#7bb6ff] text-white font-medium hover:bg-[#5fa4f0] transition disabled:opacity-40"
        >
          {cargando ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}