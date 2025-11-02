import React, { useState } from "react";
import { motion } from "framer-motion";
import Medal from "../assets/img/medal.svg"
import GoldMedal from "../assets/img/golden.svg";
import SilverMedal from "../assets/img/silver.svg";
import BronzeMedal from "../assets/img/bronze.svg";

interface LeaderboardProps {
  onVolver: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onVolver }) => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    nombre: `Participante ${i + 1}`,
    puntos: Math.floor(Math.random() * 100) + 50, 
  })).sort((a, b) => b.puntos - a.puntos); 

  const [pagina, setPagina] = useState(0);
  const itemsPorPagina = 5;
  const totalPaginas = Math.ceil(data.length / itemsPorPagina);

  const getMedalSVG = (index: number) => {
    switch (index) {
      case 0:
        return GoldMedal;
      case 1:
        return SilverMedal;
      case 2:
        return BronzeMedal;
      default:
        return Medal;
    }
  };

  const mostrarDatos = data.slice(
    pagina * itemsPorPagina,
    pagina * itemsPorPagina + itemsPorPagina
  );

  return (
    <div className="max-w-3xl w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] p-8 flex flex-col gap-6 mx-4 sm:mx-auto">
      <h2 className="text-4xl sm:text-5xl font-bold text-[#034C7D] text-center mb-4">
        Ranking de Participantes
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Visualiza los mejores resultados y fomenta la competencia sana.
      </p>

      <div className="flex flex-col gap-4">
        {mostrarDatos.map((user, index) => (
          <motion.div
            key={pagina * itemsPorPagina + index}
            className="flex justify-between items-center p-4 rounded-3xl shadow-md hover:shadow-lg transition-all border border-[#E0EDF5] bg-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <img
                src={getMedalSVG(pagina * itemsPorPagina + index)}
                alt="Medalla"
                className="w-10 h-10"
              />
              <span className="font-semibold text-lg text-[#034C7D]">
                {pagina * itemsPorPagina + index + 1}. {user.nombre}
              </span>
            </div>
            <span className="font-bold text-[#034C7D]">{user.puntos} pts</span>
          </motion.div>
        ))}
      </div>

      {/* Navegación de páginas */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setPagina((prev) => Math.max(prev - 1, 0))}
          className="bg-[#A8DADC] hover:bg-[#9BD1D1] text-[#034C7D] font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
          disabled={pagina === 0}
        >
          Anterior
        </button>
        <span className="font-semibold text-[#034C7D]">
          Página {pagina + 1} de {totalPaginas}
        </span>
        <button
          onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas - 1))}
          className="bg-[#A8DADC] hover:bg-[#9BD1D1] text-[#034C7D] font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
          disabled={pagina === totalPaginas - 1}
        >
          Siguiente
        </button>
      </div>

      <button
        onClick={onVolver}
          className="mt-6 bg-[#FFF3B0] hover:bg-[#FFEA8A] text-[#034C7D] font-semibold px-8 py-3 rounded-full 
                    shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(255,255,255,0.7)] 
                    transition-transform transform hover:-translate-y-1 hover:scale-105"
        >
          Volver
      </button>

    </div>
  );
};

export default Leaderboard;
