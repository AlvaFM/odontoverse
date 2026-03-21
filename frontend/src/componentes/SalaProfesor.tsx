
interface Props {
  codigoSesion: string;
  preguntas: string[];
  tiempo: number;
}

export default function SalaProfesor({
  codigoSesion,
  preguntas,
  tiempo,
}: Props) {
  return (
    <div>
      <h2>Sala del profesor</h2>

      <p>Código sesión: {codigoSesion}</p>

      <p>Tiempo total: {tiempo} minutos</p>

      <h3>Preguntas activas</h3>

      {preguntas.map((p, i) => (
        <p key={i}>
          {i + 1}. {p}
        </p>
      ))}

      <h3>Alumnos conectados</h3>

      <p>(Aquí aparecerán cuando conectemos Firebase)</p>

      <button>
        Iniciar temporizador
      </button>
    </div>
  );
}

