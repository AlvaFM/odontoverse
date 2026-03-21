
import { useState } from "react";
import SalaProfesor from "./SalaProfesor";

interface Props {
  codigoSesion: string;
  diagnostico: string;
}

export default function ConfigurarSesion({
  codigoSesion,
  diagnostico,
}: Props) {
  const [preguntas, setPreguntas] = useState([""]);
  const [tiempo, setTiempo] = useState(10);
  const [continuar, setContinuar] = useState(false);

  const agregarPregunta = () => {
    setPreguntas([...preguntas, ""]);
  };

  const actualizarPregunta = (index: number, valor: string) => {
    const nuevas = [...preguntas];
    nuevas[index] = valor;
    setPreguntas(nuevas);
  };

  if (continuar) {
    return (
      <SalaProfesor
        codigoSesion={codigoSesion}
        preguntas={preguntas}
        tiempo={tiempo}
      />
    );
  }

  return (
    <div>
      <h2>Configurar sesión clínica</h2>

      <p>Diagnóstico confirmado: {diagnostico}</p>

      <h3>Tiempo para alumnos (minutos)</h3>

      <input
        type="number"
        value={tiempo}
        onChange={(e) => setTiempo(Number(e.target.value))}
      />

      <h3>Preguntas clínicas</h3>

      {preguntas.map((pregunta, index) => (
        <div key={index}>
          <input
            type="text"
            value={pregunta}
            onChange={(e) =>
              actualizarPregunta(index, e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={agregarPregunta}>
        Agregar pregunta
      </button>

      <br /><br />

      <button onClick={() => setContinuar(true)}>
        Abrir sala
      </button>
    </div>
  );
}

