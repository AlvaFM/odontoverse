
import { Brain, Loader2 } from 'lucide-react';

export default function Analyzing() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="bg-blue-100 p-4 rounded-full">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Analizando radiografía...
      </h2>
      
      <p className="text-gray-600 mb-6">
        Nuestra IA está procesando la imagen y generando el diagnóstico.
        Este proceso puede tomar unos momentos.
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
      </div>

      <p className="text-sm text-gray-500">
        Analizando patrones y estructuras dentales...
      </p>
    </div>
  );
}