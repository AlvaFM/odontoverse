import { useState, useEffect } from "react";
import SeleccionModo from "./componentes/SeleccionModo";
import IngresarSesion from "./componentes/IngresarSesion";
import LoginProfesor from "./componentes/loginProfesor";
import DashboardProfesor from "./componentes/DashboardProfesor";
import CrearSesion from "./componentes/CrearSesion";
import SubirCaso from "./componentes/SubirCaso";
import ConfirmarDiagnostico from "./componentes/ConfirmarDiagnostico";
import ConfigurarSesion from "./componentes/ConfigurarSesion";
import SalaProfesor from "./componentes/SalaProfesor";
import BarraNavegacion from "./componentes/BarraNavegacion";
import { supabase } from "./lib/supabase";

function App() {
  const [vista, setVista] = useState("seleccion");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [profesorEmail, setProfesorEmail] = useState<string | null>(null);
  
  // Estados para pasar entre componentes
  const [codigoSesion, setCodigoSesion] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [confianza, setConfianza] = useState(0);
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [tiempo, setTiempo] = useState(10);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const tieneSesion = !!session;
      setSesionIniciada(tieneSesion);
      setProfesorEmail(session?.user?.email ?? null);
      
      console.log("Sesion verificada - activa:", tieneSesion);
      
      if (tieneSesion) {
        setVista("dashboard");
      }
    };

    verificarSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const tieneSesion = !!session;
      setSesionIniciada(tieneSesion);
      setProfesorEmail(session?.user?.email ?? null);
      console.log("Auth state changed - sesion activa:", tieneSesion);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cambiarVista = (nuevaVista: string) => {
    if (vista !== nuevaVista) {
      console.log("Cambiando vista de:", vista, "a:", nuevaVista);
      setVista(nuevaVista);
    } else {
      console.log("Ya estabas en", nuevaVista, "- no hay cambio");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfesorEmail(null);
    setSesionIniciada(false);
    setVista("seleccion");
  };

  const renderVista = () => {
    switch (vista) {
      case "ingresar":
        return <IngresarSesion />;

      case "login":
        return (
          <LoginProfesor
            onLoginSuccess={(email) => {
              console.log("Profesor logueado:", email);
              setProfesorEmail(email);
              setSesionIniciada(true);
              setVista("dashboard");
            }}
          />
        );

      case "dashboard":
        return (
          <DashboardProfesor
            profesorEmail={profesorEmail || ""}
            onLogout={handleLogout}
          />
        );

      case "crearSesion":
        return (
          <CrearSesion
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("dashboard")}
          />
        );

      case "subirCaso":
        return (
          <SubirCaso
            codigoSesion={codigoSesion}
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("crearSesion")}
          />
        );

      case "confirmarDiagnostico":
        return (
          <ConfirmarDiagnostico
            codigoSesion={codigoSesion}
            diagnostico={diagnostico}
            confianza={confianza}
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("subirCaso")}
          />
        );

      case "configurarSesion":
        return (
          <ConfigurarSesion
            codigoSesion={codigoSesion}
            diagnostico={diagnostico}
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("dashboard")}
          />
        );

      case "salaProfesor":
        return (
          <SalaProfesor
            codigoSesion={codigoSesion}
            preguntas={preguntas}
            tiempo={tiempo}
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("dashboard")}
          />
        );

      case "seleccion":
      default:
        return <SeleccionModo onNavigate={cambiarVista} />;
    }
  };

  return (
    <div>
      <BarraNavegacion
        onNavigate={cambiarVista}
        sesionIniciada={sesionIniciada}
        vistaActual={vista}
      />

      <div style={{ padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}

export default App;