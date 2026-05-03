// components/BotonVolver.tsx
import { ArrowLeft } from "lucide-react"; // o usa cualquier ícono que prefieras

interface BotonVolverProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export default function BotonVolver({ 
  onClick, 
  className = "", 
  label = "Volver" 
}: BotonVolverProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-3 py-2 rounded-lg text-sm font-medium
        text-gray-600 hover:text-gray-900
        hover:bg-gray-100/80
        transition-all duration-200
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}