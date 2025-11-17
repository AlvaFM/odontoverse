import { useState, useEffect } from "react";
import Leaderboard from "./Leaderboard";

interface Props {
  codigo: string;
  onVolver: () => void;
}

interface Estudiante {
  nombre: string;
  estado: "pendiente" | "completo" | "abandonó";
  tiempoInicio: Date;
  tiempoFinalizacion?: Date;
  tiempoTranscurrido: number;
  respuesta?: "a" | "b" | "c" | "d";
}

// Componente para el gráfico de torta
const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedAngle = 0;

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, index) => {
          if (item.value === 0) return null;
          
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const x1 = 50 + 50 * Math.cos(accumulatedAngle * Math.PI / 180);
          const y1 = 50 + 50 * Math.sin(accumulatedAngle * Math.PI / 180);
          
          accumulatedAngle += angle;
          
          const x2 = 50 + 50 * Math.cos(accumulatedAngle * Math.PI / 180);
          const y2 = 50 + 50 * Math.sin(accumulatedAngle * Math.PI / 180);

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="50" cy="50" r="30" fill="white" />
      </svg>
      
      {/* Leyenda */}
      <div className="absolute -right-32 top-0 bottom-0 flex flex-col justify-center space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-700 whitespace-nowrap">
              {item.label}: {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SessionDashboard({ codigo, onVolver }: Props) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [mostrarLeaderboard, setMostrarLeaderboard] = useState(false);

  // Nombres realistas para 20 estudiantes
  const nombresEstudiantes = [
    "Ana García", "Carlos López", "María Rodríguez", "José Martínez", 
    "Laura Hernández", "Miguel Sánchez", "Elena Pérez", "David González",
    "Sofía Ramírez", "Javier Torres", "Isabel Flores", "Roberto Díaz",
    "Carmen Ruiz", "Francisco Morales", "Patricia Castro", "Daniel Ortega",
    "Lucía Mendoza", "Alejandro Silva", "Raquel Vargas", "Pedro Rojas"
  ];

  useEffect(() => {
    // Inicializar todos los estudiantes como pendientes
    const estudiantesIniciales: Estudiante[] = nombresEstudiantes.map((nombre, index) => ({
      nombre,
      estado: "pendiente",
      tiempoInicio: new Date(),
      tiempoTranscurrido: 0
    }));
    
    setEstudiantes(estudiantesIniciales);
  }, []);

  // Timer principal que actualiza el tiempo transcurrido
  useEffect(() => {
    const intervalo = setInterval(() => {
      setEstudiantes(prev => 
        prev.map(estudiante => ({
          ...estudiante,
          tiempoTranscurrido: estudiante.estado === "pendiente" 
            ? estudiante.tiempoTranscurrido + 1 
            : estudiante.tiempoTranscurrido
        }))
      );
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // Simulación de cambios de estado (completar o abandonar) con respuestas
  useEffect(() => {
    const intervaloSimulacion = setInterval(() => {
      setEstudiantes(prev => {
        const pendientes = prev.filter(e => e.estado === "pendiente");
        if (pendientes.length === 0) return prev;

        const estudianteIndex = Math.floor(Math.random() * pendientes.length);
        const estudiante = pendientes[estudianteIndex];
        const random = Math.random();

        let nuevoEstado: "completo" | "abandonó" = "completo";
        
        // 70% probabilidad de completar, 30% de abandonar
        if (random > 0.7) {
          nuevoEstado = "abandonó";
        }

        // Generar respuesta aleatoria (a, b, c, d) solo si completó
        const respuestas: ("a" | "b" | "c" | "d")[] = ["a", "b", "c", "d"];
        const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];

        return prev.map(e => 
          e.nombre === estudiante.nombre && e.estado === "pendiente"
            ? {
                ...e,
                estado: nuevoEstado,
                tiempoFinalizacion: new Date(),
                respuesta: nuevoEstado === "completo" ? respuestaAleatoria : undefined
              }
            : e
        );
      });
    }, 2000); // Cada 2 segundos un estudiante cambia de estado

    return () => clearInterval(intervaloSimulacion);
  }, []);

  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorRespuesta = (respuesta: string) => {
    switch (respuesta) {
      case "a": return "bg-blue-100 text-blue-700 border-blue-200";
      case "b": return "bg-green-100 text-green-700 border-green-200";
      case "c": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "d": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Estadísticas
  const estudiantesCompletados = estudiantes.filter(e => e.estado === "completo").length;
  const estudiantesAbandonaron = estudiantes.filter(e => e.estado === "abandonó").length;
  const estudiantesPendientes = estudiantes.filter(e => e.estado === "pendiente").length;

  // Estadísticas de respuestas
  const respuestasA = estudiantes.filter(e => e.respuesta === "a").length;
  const respuestasB = estudiantes.filter(e => e.respuesta === "b").length;
  const respuestasC = estudiantes.filter(e => e.respuesta === "c").length;
  const respuestasD = estudiantes.filter(e => e.respuesta === "d").length;

  // Datos para el gráfico de torta
  const chartData = [
    { label: "Opción A", value: respuestasA, color: "#3b82f6" },
    { label: "Opción B", value: respuestasB, color: "#10b981" },
    { label: "Opción C", value: respuestasC, color: "#f59e0b" },
    { label: "Opción D", value: respuestasD, color: "#8b5cf6" },
    { label: "Abandonaron", value: estudiantesAbandonaron, color: "#ef4444" },
    { label: "En proceso", value: estudiantesPendientes, color: "#6b7280" }
  ].filter(item => item.value > 0);

  if (mostrarLeaderboard) {
    return <Leaderboard onVolver={onVolver} />;
  }

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                 p-8 sm:p-10 lg:p-12
                 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
                 mx-auto flex flex-col gap-6 border border-[#E0EDF5] transition-all duration-500"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#034C7D] text-center">
        Sesión activa
      </h2>
      <p className="text-sm sm:text-base text-[#034C7D] text-center">
        Código: <b>{codigo}</b>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Lista de estudiantes */}
        <div className="flex flex-col">
          {/* Estadísticas de estado */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
              <div className="text-xl font-bold text-green-700">{estudiantesCompletados}</div>
              <div className="text-xs text-green-700 opacity-80">Completados</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center border border-yellow-100">
              <div className="text-xl font-bold text-yellow-700">{estudiantesPendientes}</div>
              <div className="text-xs text-yellow-700 opacity-80">En proceso</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
              <div className="text-xl font-bold text-red-700">{estudiantesAbandonaron}</div>
              <div className="text-xs text-red-700 opacity-80">Abandonaron</div>
            </div>
          </div>

          {/* Estadísticas de respuestas */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
              <div className="text-lg font-bold text-blue-700">{respuestasA}</div>
              <div className="text-xs text-blue-700 opacity-80">A</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2 text-center border border-green-100">
              <div className="text-lg font-bold text-green-700">{respuestasB}</div>
              <div className="text-xs text-green-700 opacity-80">B</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-2 text-center border border-yellow-100">
              <div className="text-lg font-bold text-yellow-700">{respuestasC}</div>
              <div className="text-xs text-yellow-700 opacity-80">C</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-2 text-center border border-purple-100">
              <div className="text-lg font-bold text-purple-700">{respuestasD}</div>
              <div className="text-xs text-purple-700 opacity-80">D</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {estudiantes.map((e, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 px-4 rounded-2xl border border-[#D0E0F0] bg-white/70 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]
                           transition-all duration-300 hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
              >
                <div className="flex flex-col">
                  <span className="text-[#034C7D] font-medium">{e.nombre}</span>
                  <span className="text-xs text-gray-500">
                    Tiempo: {formatTiempo(e.tiempoTranscurrido)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Mostrar respuesta si completó */}
                  {e.estado === "completo" && e.respuesta && (
                    <div className={`px-2 py-1 rounded-lg text-sm font-bold border ${getColorRespuesta(e.respuesta)}`}>
                      Opción {e.respuesta.toUpperCase()}
                    </div>
                  )}
                  
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      e.estado === "completo"
                        ? "bg-green-100 text-green-700"
                        : e.estado === "abandonó"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {e.estado === "completo" ? "Terminado" : 
                     e.estado === "abandonó" ? "Abandonó" : "En progreso"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha - Gráfico de torta */}
        <div className="flex flex-col items-center justify-center bg-white/50 rounded-3xl p-6 border border-[#E0EDF5]">
          <h3 className="text-xl font-bold text-[#034C7D] mb-4">Distribución de Respuestas</h3>
          <PieChart data={chartData} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Total estudiantes: <b>{estudiantes.length}</b>
            </p>
            <p className="text-sm text-gray-600">
              Completados: <b>{estudiantesCompletados}</b> ({Math.round((estudiantesCompletados / estudiantes.length) * 100)}%)
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setMostrarLeaderboard(true)}
        className="mt-6 bg-[#F7C948] hover:bg-[#E1C650] text-white font-semibold px-6 py-4 rounded-3xl shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] transition-transform transform hover:-translate-y-1 hover:scale-105"
      >
        Finalizar sesión
      </button>
    </div>
  );
}