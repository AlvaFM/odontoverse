import { useState, useEffect } from "react";
import SeleccionModo from "./componentes/SeleccionModo";
import IngresarSesion from "./componentes/IngresarSesion";
import LoginProfesor from "./componentes/loginProfesor";
import CrearSesion from "./componentes/CrearSesion";
import InicioProfesor from "./componentes/InicioProfesor"; 
import DashboardProfesor from "./componentes/DashboardProfesor"; 
import BarraNavegacion from "./componentes/BarraNavegacion";
import { supabase } from "./lib/supabase";

function App() {
  const [vista, setVista] = useState("seleccion");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [profesorEmail, setProfesorEmail] = useState<string | null>(null);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSesionIniciada(!!session);
      setProfesorEmail(session?.user?.email ?? null);
    };

    verificarSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesionIniciada(!!session);
      setProfesorEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cambiarVista = (nuevaVista: string) => {
    setVista(nuevaVista);
  };

  const volver = () => {
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
              setVista("inicioProfesor");
            }}
          />
        );

      case "inicioProfesor":
        return (
          <InicioProfesor
            profesorEmail={profesorEmail || ""}
            onCrearSesion={() => setVista("crearSesion")}
            onIrDashboard={() => setVista("dashboard")} onVolver={function (): void {
              throw new Error("Function not implemented.");
            } }          />
        );

      case "crearSesion":
        return (
          <CrearSesion
            profesorEmail={profesorEmail || ""}
            onVolver={() => setVista("inicioProfesor")}
          />
        );

      case "dashboard":
        return (
          <DashboardProfesor
            profesorEmail={profesorEmail || ""} onLogout={function (): void {
              throw new Error("Function not implemented.");
            } }          />
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
        vistaActual={vista}
        onVolver={volver}
        sesionIniciada={sesionIniciada}
      />

      <div style={{ padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}

export default App;