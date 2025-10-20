import { useState, useEffect } from "react";

interface Props {
  codigo: string;
  onVolver: () => void;
}

export default function SessionDashboard({ codigo, onVolver }: Props) {
  const [estudiantes, setEstudiantes] = useState<{ nombre: string; estado: "pendiente" | "completo" }[]>([]);

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
    <div className="bg-white shadow-md rounded-xl p-6 w-96 text-center">
      <h2 className="text-2xl font-semibold mb-4">Sesión Activa</h2>
      <p className="text-sm mb-2 text-gray-600">Código: <b>{codigo}</b></p>

      <div className="text-left">
        {estudiantes.length === 0 && <p className="text-gray-500">Esperando estudiantes...</p>}
        {estudiantes.map((e, i) => (
          <div key={i} className="flex justify-between py-1 border-b text-sm">
            <span>{e.nombre}</span>
            <span className={e.estado === "completo" ? "text-green-600" : "text-gray-500"}>
              {e.estado === "completo" ? "✔️ Terminado" : "⏳ En progreso"}
            </span>
          </div>
        ))}
      </div>

      <button onClick={onVolver} className="mt-4 text-gray-600 text-sm underline">
        Finalizar sesión
      </button>
    </div>
  );
}
