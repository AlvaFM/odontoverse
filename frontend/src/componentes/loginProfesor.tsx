import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  onLoginSuccess: (email: string) => void;
}

export default function LoginProfesor({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (isLogin) {
      // Iniciar sesión
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
        // Registrar/verificar profesor en tabla profesores
        await supabase.from("profesores").upsert({
          email: data.user.email,
          id: data.user.id,
        });

        onLoginSuccess(data.user.email!);
      }
    } else {
      // Registrarse
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
        // Crear registro en tabla profesores
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
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button 
          type="submit" 
          disabled={cargando}
          style={{ width: "100%", padding: "10px", margin: "8px 0" }}
        >
          {cargando ? "Cargando..." : (isLogin ? "Ingresar" : "Registrarse")}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        style={{ width: "100%", padding: "10px", margin: "8px 0" }}
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}

///COMENTARIO LOGIN EN MAYUSCULA 