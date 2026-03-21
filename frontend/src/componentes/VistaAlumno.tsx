import { useEffect, useState } from "react";

interface Props {
  nombre: string;
  codigoSesion: string;
}

export default function VistaAlumno({
  nombre,
  codigoSesion,
}: Props) {
  const preguntas = [
    "¿Qué diagnóstico observa?",
    "¿Qué tratamiento propone?",
    "¿Qué hallazgo clínico destaca?",
  ];

  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>(
    Array(preguntas.length).fill("")
  );

  const [tiempo, setTiempo] = useState(60);
  const [tiempoFinalizado, setTiempoFinalizado] = useState(false);

  useEffect(() => {
    if (tiempo <= 0) {
      setTiempoFinalizado(true);
      return;
    }

    const intervalo = setInterval(() => {
      setTiempo((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempo]);

  const guardarRespuesta = (valor: string) => {
    const nuevas = [...respuestas];
    nuevas[indicePregunta] = valor;
    setRespuestas(nuevas);
  };

  const siguientePregunta = () => {
    if (indicePregunta < preguntas.length - 1) {
      setIndicePregunta(indicePregunta + 1);
    }
  };

  if (tiempoFinalizado) {
    return (
      <div>
        <h2>Tiempo finalizado</h2>
        <p>Las respuestas quedaron cerradas.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Alumno: {nombre}</h2>
      <p>Sesión: {codigoSesion}</p>

      <h3>Tiempo restante: {tiempo} segundos</h3>

      <hr />

      <h3>Pregunta {indicePregunta + 1}</h3>
      <p>{preguntas[indicePregunta]}</p>

      <textarea
        rows={5}
        cols={50}
        value={respuestas[indicePregunta]}
        onChange={(e) => guardarRespuesta(e.target.value)}
      />

      <br /><br />

      {indicePregunta < preguntas.length - 1 ? (
        <button onClick={siguientePregunta}>
          Siguiente pregunta
        </button>
      ) : (
        <button>
          Enviar respuestas
        </button>
      )}
    </div>
  );
}

