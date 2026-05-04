import dienteLike from "../assets/img/dientelupa.png";

interface Props {
  profesorEmail: string;
  onCrearSesion: () => void;
  onIrDashboard: () => void;
  onVolver: () => void;
}

export default function InicioProfesor({
  profesorEmail,
  onCrearSesion,
  onIrDashboard,
  onVolver,
}: Props) {
  const opciones = [
    {
      key: "crear",
      label: "Crear nueva sesión",
      descripcion: "Genera un código para comenzar",
      action: onCrearSesion,
      base: "bg-[#cfeaf6]",
      hover: "hover:bg-[#b9e0f2]",
    },
    {
      key: "dashboard",
      label: "Ir al dashboard",
      descripcion: "Gestiona sesiones y revisa actividad",
      action: onIrDashboard,
      base: "bg-[#c8e3f3]",
      hover: "hover:bg-[#b3d8ee]",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#eef6fb] px-4">

      {/* HEADER */}
      <div className="mb-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-[#eef6ff] rounded-2xl flex items-center justify-center">
          <img src={dienteLike} className="w-9 h-9 object-contain" />
        </div>

        <h1 className="text-2xl font-semibold text-[#1e3a5f]">
          Panel del profesor
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          {profesorEmail}
        </p>
      </div>

      {/* CARDS */}
      <div className="w-full max-w-[800px] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        {opciones.map((op) => (
          <div
            key={op.key}
            onClick={op.action}
            className={`
              flex-1 flex flex-col justify-center items-center text-center
              px-6 py-12 cursor-pointer
              transition-all duration-300 group
              ${op.base} ${op.hover}
              hover:scale-[1.03]
            `}
          >
            <h2 className="text-lg font-semibold text-[#1e3a5f]">
              {op.label}
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-[220px]">
              {op.descripcion}
            </p>
          </div>
        ))}
      </div>

      {/* VOLVER */}
      <button
        onClick={onVolver}
        className="mt-8 text-sm text-slate-500 hover:text-[#1e3a5f] transition"
      >
        Volver
      </button>
    </div>
  );
}