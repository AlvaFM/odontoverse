import teacherIcon from "../assets/img/teacher.svg";
import studentIcon from "../assets/img/student.svg";

interface Props {
  onNavigate?: (vista: string) => void;
}

export default function SeleccionModo({ onNavigate }: Props) {
  const opciones = [
    {
      key: "ingresar",
      label: "Alumno",
      img: studentIcon,
      base: "bg-[#cfeaf6]",
      hover: "hover:bg-[#b9e0f2]",
    },
    {
      key: "login",
      label: "Profesor",
      img: teacherIcon,
      base: "bg-[#c8e3f3]",
      hover: "hover:bg-[#b3d8ee]",
    },
  ];

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f7fbfd] px-4">

      {/* HEADER */}
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1e3a5f]">
          Bienvenido a OdontoAI
        </h1>
        <p className="text-slate-500 mt-2 text-base md:text-lg">
          Selecciona un modo
        </p>
      </div>

      {/* CARDS */}
      <div
        className="
          w-full max-w-[80%]
          h-[55vh]
          flex flex-col md:flex-row
          rounded-2xl overflow-hidden shadow-md
        "
      >
        {opciones.map((op) => (
          <div
            key={op.key}
            onClick={() => onNavigate?.(op.key)}
            className={`
              flex-1 flex flex-col items-center justify-center cursor-pointer
              transition-all duration-300 group
              ${op.base} ${op.hover}
              hover:scale-[1.05] hover:shadow-xl
            `}
          >
            {/* ICONO */}
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <img
                src={op.img}
                alt={`${op.label} icon`}
                className="
                  w-full h-full object-contain opacity-80
                  group-hover:opacity-100
                  group-hover:brightness-0
                  group-hover:invert
                  transition-all duration-300
                "
              />
            </div>

            {/* TEXTO */}
            <span className="text-lg font-medium text-slate-700 group-hover:text-[rgb(30,58,95)] transition">
              {op.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}