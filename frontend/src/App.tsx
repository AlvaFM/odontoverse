import { useState } from "react";
import SeleccionModo from "./componentes/SeleccionModo";
import IngresarSesion from "./componentes/IngresarSesion";
import LoginProfesor from "./componentes/LoginProfesor";  
import BarraNavegacion from "./componentes/BarraNavegacion";

function App() {
  const [vista, setVista] = useState("seleccion");

  const renderVista = () => {
    switch (vista) {
      case "ingresar":
        return <IngresarSesion />;
      case "login":
        return <LoginProfesor onLoginSuccess={(email) => {
          console.log("Profesor logueado:", email);
          setVista("seleccion");
        }} />;
      case "seleccion":
      default:
        return <SeleccionModo />;
    }
  };

  return (
    <div>
      <BarraNavegacion onNavigate={setVista} vistaActual={vista} />
      <div style={{ padding: "20px" }}>
        {renderVista()}
      </div>
    </div>
  );
}

export default App;