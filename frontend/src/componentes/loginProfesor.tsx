import { useState } from "react";
import { supabase } from "../lib/supabase";
import dienteLike from "../assets/img/dientelike.png";

interface Props {
  onLoginSuccess: (email: string) => void;
  onVolver?: () => void;
}

export default function LoginProfesor({ onLoginSuccess, onVolver }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleVolver = () => {
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }

      if (data.user) {
        await supabase.from("profesores").upsert({
          email: data.user.email,
          id: data.user.id,
        });

        onLoginSuccess(data.user.email!);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }

      if (data.user) {
        await supabase.from("profesores").insert({
          email: data.user.email,
          id: data.user.id,
        });

        alert("Registro exitoso. Ahora inicia sesión.");
        setIsLogin(true);
        setCargando(false);
      }
    }

    setCargando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 relative">
        
        {/* Botón Volver */}
        <button
          onClick={handleVolver}
          className="absolute top-4 left-4 text-sm text-slate-500 hover:text-[#1e3a5f] transition flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm"
        >
          ← Volver
        </button>

        {/* Icono */}
        <div className="w-14 h-14 mx-auto bg-[#eef6ff] rounded-2xl flex items-center justify-center mb-4">
          <img src={dienteLike} className="w-9 h-9 object-contain" />
        </div>

        {/* TÍTULO */}
        <h2 className="text-2xl font-semibold text-center text-[#1e3a5f] mb-2">
          {isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}
        </h2>

        <p className="text-center text-slate-500 mb-6 text-sm">
          {isLogin ? "Ingresa como profesor" : "Regístrate como profesor"}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-[#9ecbff]
                       text-sm"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-[#9ecbff]
                       text-sm"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="
              w-full py-3 rounded-xl text-sm font-medium
              bg-[#9ecbff] text-[#1e3a5f]
              hover:bg-[#81b0d6]
              transition-all duration-200
            "
          >
            {cargando
              ? "Cargando..."
              : isLogin
              ? "Ingresar"
              : "Registrarse"}
          </button>
        </form>

        {/* SWITCH */}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-5 w-full text-sm text-slate-500 hover:text-[#1e3a5f] transition"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}