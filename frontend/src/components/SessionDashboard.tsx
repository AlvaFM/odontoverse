import { useState, useEffect } from "react";

interface Props {
  codigo: string;
  onVolver: () => void;
}

interface Estudiante {
  nombre: string;
  estado: "pendiente" | "completo";
}

export default function SessionDashboard({ codigo, onVolver }: Props) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  // Simulación: cada 5 seg se agrega un estudiante o cambia su estado
  useEffect(() => {
    const intervalo = setInterval(() => {
      setEstudiantes((prev) => {
        if (prev.length < 5) {
          return [...prev, { nombre: `Alumno ${prev.length + 1}`, estado: "pendiente" }];
        } else {
          const copia = [...prev];
          const index = Math.floor(Math.random() * copia.length);
          copia[index].estado = "completo";
          return [...copia];
        }
      });
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                 p-8 sm:p-10 lg:p-12
                 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl
                 mx-auto flex flex-col gap-6 border border-[#E0EDF5] transition-all duration-500"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034C7D] text-center">
        Sesión activa
      </h2>
      <p className="text-sm sm:text-base text-[#034C7D] text-center">
        Código: <b>{codigo}</b>
      </p>

      <div className="flex flex-col gap-3 mt-4">
        {estudiantes.length === 0 && (
          <p className="text-[#034C7D] text-center py-6 bg-[#F0F7FB] rounded-2xl border border-[#D0E0F0]">
            Esperando estudiantes...
          </p>
        )}
        {estudiantes.map((e, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-3 px-4 rounded-2xl border border-[#D0E0F0] bg-white/70 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]
                       transition-all duration-300 hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
          >
            <span className="text-[#034C7D] font-medium">{e.nombre}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                e.estado === "completo"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {e.estado === "completo" ? "Terminado" : "En progreso"}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onVolver}
        className="mt-6 bg-[#F7C948] hover:bg-[#E1C650] text-white font-semibold px-6 py-4 rounded-3xl shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
      >
        Finalizar sesión
      </button>
    </div>
  );
}
