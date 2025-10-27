import { useState } from "react";

interface Props {
  codigo: string;
  radiografiaURL?: string | null;
  onVolver: () => void;
}

interface Diente {
  fdi: string;
  nombre: string;
}

// Dientes superiores e inferiores
const dientesSuperiores: Diente[] = [
  { fdi: "18", nombre: "Tercer Molar" }, { fdi: "17", nombre: "Segundo Molar" },
  { fdi: "16", nombre: "Primer Molar" }, { fdi: "15", nombre: "Segundo Premolar" },
  { fdi: "14", nombre: "Primer Premolar" }, { fdi: "13", nombre: "Canino" },
  { fdi: "12", nombre: "Incisivo Lat." }, { fdi: "11", nombre: "Incisivo Cen." },
  { fdi: "21", nombre: "Incisivo Cen." }, { fdi: "22", nombre: "Incisivo Lat." },
  { fdi: "23", nombre: "Canino" }, { fdi: "24", nombre: "Primer Premolar" },
  { fdi: "25", nombre: "Segundo Premolar" }, { fdi: "26", nombre: "Primer Molar" },
  { fdi: "27", nombre: "Segundo Molar" }, { fdi: "28", nombre: "Tercer Molar" },
];

const dientesInferiores: Diente[] = [
  { fdi: "48", nombre: "Tercer Molar" }, { fdi: "47", nombre: "Segundo Molar" },
  { fdi: "46", nombre: "Primer Molar" }, { fdi: "45", nombre: "Segundo Premolar" },
  { fdi: "44", nombre: "Primer Premolar" }, { fdi: "43", nombre: "Canino" },
  { fdi: "42", nombre: "Incisivo Lat." }, { fdi: "41", nombre: "Incisivo Cen." },
  { fdi: "31", nombre: "Incisivo Cen." }, { fdi: "32", nombre: "Incisivo Lat." },
  { fdi: "33", nombre: "Canino" }, { fdi: "34", nombre: "Primer Premolar" },
  { fdi: "35", nombre: "Segundo Premolar" }, { fdi: "36", nombre: "Primer Molar" },
  { fdi: "37", nombre: "Segundo Molar" }, { fdi: "38", nombre: "Tercer Molar" },
];

const diagnosticos = ["Caries", "Fractura", "Restauración"];

export default function SessionStudentView({ codigo, radiografiaURL, onVolver }: Props) {
  const [dienteSeleccionado, setDienteSeleccionado] = useState<Diente | null>(null);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<string | null>(null);

  const enviarDiagnostico = () => {
    if (!dienteSeleccionado || !diagnosticoSeleccionado) {
      alert("Selecciona un diente y un diagnóstico antes de enviar");
      return;
    }
    alert(`Diente ${dienteSeleccionado.fdi} (${dienteSeleccionado.nombre}) - Diagnóstico: ${diagnosticoSeleccionado}`);
    setDienteSeleccionado(null);
    setDiagnosticoSeleccionado(null);
  };

  return (
    <div className="bg-[#D6E6F2] border border-[#E0E0E0] shadow-xl rounded-2xl p-6 w-full max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 text-[#034C7D]">Sesión {codigo}</h2>

      {radiografiaURL && (
        <div className="mb-6">
          <img
            src={radiografiaURL}
            alt="Radiografía"
            className="max-h-64 rounded-lg border border-[#E0E0E0] mx-auto shadow-md"
          />
        </div>
      )}

      <p className="text-[#034C7D] mb-4 font-medium">Selecciona el diente afectado:</p>

      {/* Dientes superiores */}
      <div className="flex justify-center mb-2 gap-2 flex-wrap">
        {dientesSuperiores.map((diente, i) => (
          <button
            key={diente.fdi}
            onClick={() => setDienteSeleccionado(diente)}
            className={`w-16 h-20 rounded-t-2xl border border-[#E0E0E0] flex flex-col justify-center items-center text-sm shadow-md transition ${
              dienteSeleccionado?.fdi === diente.fdi ? "bg-[#76C7F3] text-white" : "bg-white hover:bg-[#BDE0F7]"
            }`}
            style={{ transform: `translateY(${Math.sin(i / 16 * Math.PI) * -5}px)` }}
          >
            <span className="font-bold">{diente.fdi}</span>
            <span className="text-xs">{diente.nombre}</span>
          </button>
        ))}
      </div>

      {/* Dientes inferiores */}
      <div className="flex justify-center mb-4 gap-2 flex-wrap">
        {dientesInferiores.map((diente, i) => (
          <button
            key={diente.fdi}
            onClick={() => setDienteSeleccionado(diente)}
            className={`w-16 h-20 rounded-b-2xl border border-[#E0E0E0] flex flex-col justify-center items-center text-sm shadow-md transition ${
              dienteSeleccionado?.fdi === diente.fdi ? "bg-[#76C7F3] text-white" : "bg-white hover:bg-[#BDE0F7]"
            }`}
            style={{ transform: `translateY(${Math.sin(i / 16 * Math.PI) * 5}px)` }}
          >
            <span className="font-bold">{diente.fdi}</span>
            <span className="text-xs">{diente.nombre}</span>
          </button>
        ))}
      </div>

      {/* Selección de análisis */}
      {dienteSeleccionado && (
        <>
          <p className="text-[#034C7D] mb-2 font-medium">Selecciona el análisis:</p>
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {diagnosticos.map((d) => (
              <button
                key={d}
                onClick={() => setDiagnosticoSeleccionado(d)}
                className={`px-5 py-2 rounded-full font-semibold shadow-md transition ${
                  diagnosticoSeleccionado === d ? "bg-[#76C7F3] text-white" : "bg-white hover:bg-[#BDE0F7]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={enviarDiagnostico}
        className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-6 py-3 rounded-full w-full mb-3 font-semibold shadow-lg transition"
      >
        Enviar análisis
      </button>

      <button
        onClick={onVolver}
        className="text-[#034C7D] text-sm underline"
      >
        Salir
      </button>
    </div>
  );
}
