
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OdontoAI</h1>
            <p className="text-sm text-gray-600">Sistema de Análisis de Radiografías Dentales</p>
          </div>
        </div>
      </div>
    </header>
  );
}