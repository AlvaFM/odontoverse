import { useEffect, useState } from "react";
import dienteLike from "../assets/img/dientelike.png";
import dienteLupa from "../assets/img/dientelupa.png";

interface Props {
  onClose: () => void;
}

type Paso = {
  texto: string;
  posicion: "centro" | "izquierda" | "derecha";
  imagen: "lupa" | "like";
};

const pasos: Paso[] = [
  {
    texto:
      "Bienvenido a OdontoAI, donde podrás reforzar tus conocimiento de odontología y análisis",
    posicion: "centro",
    imagen: "lupa",
  },
  {
    texto:
      "Este es el modo alumno, donde podrás ingresar a sesiones de cuestionarios por medio de un código que te entregará tu docente.",
    posicion: "izquierda",
    imagen: "lupa",
  },
  {
    texto:
      "En el modo profesor se configuran los cuestionarios y se hace el análisis con IA de la radiografía a utilizar como ejemplo.",
    posicion: "derecha",
    imagen: "lupa",
  },
  {
    texto:
      "Y eso es todo por el momento, te recomiendo darte un vuelta en la aplicación para descubrir todas sus funcionalidades ¡Nos vemos!",
    posicion: "centro",
    imagen: "like",
  },
];

export default function Tutorial({ onClose }: Props) {
  const [pasoActual, setPasoActual] = useState(0);
  const [textoVisible, setTextoVisible] = useState("");

  const paso = pasos[pasoActual];

  // ✍️ efecto escritura
  useEffect(() => {
    let i = 0;
    setTextoVisible("");

    const intervalo = setInterval(() => {
      setTextoVisible(paso.texto.slice(0, i + 1));
      i++;
      if (i >= paso.texto.length) clearInterval(intervalo);
    }, 20);

    return () => clearInterval(intervalo);
  }, [pasoActual]);

  const siguiente = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual((p) => p + 1);
    } else {
      onClose();
    }
  };

  const getPosition = () => {
    switch (paso.posicion) {
      case "centro":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "izquierda":
        return "top-1/2 left-24 -translate-y-1/2";
      case "derecha":
        return "top-1/2 right-24 -translate-y-1/2";
    }
  };

  const imagenSrc = paso.imagen === "like" ? dienteLike : dienteLupa;

  return (
    <>
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/40 z-40 pointer-events-auto" />

      {/* Caja */}
      <div
        className={`
          fixed ${getPosition()}
          bg-white p-6 rounded-2xl shadow-2xl max-w-md z-50
          transition-all duration-500 ease-out
          animate-[fadeIn_0.4s_ease]
        `}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500"
        >
          ✕
        </button>

        {/* Mascota */}
        <div className="flex justify-center mb-4">
          <img
            key={pasoActual}
            src={imagenSrc}
            alt="mascota"
            className={`
              w-24 drop-shadow-lg
              ${
                paso.imagen === "like"
                  ? "animate-[popIn_0.5s_ease-out, float_3s_ease-in-out_infinite]"
                  : "animate-[fadeIn_0.4s_ease, float_3s_ease-in-out_infinite]"
              }
            `}
          />
        </div>

        {/* Texto */}
        <p className="text-sm text-gray-700 min-h-[60px]">
          {textoVisible}
        </p>

        {/* Botón */}
        <button
          onClick={siguiente}
          className="mt-4 text-blue-600 font-medium hover:underline"
        >
          {pasoActual === pasos.length - 1 ? "Finalizar" : "Siguiente →"}
        </button>
      </div>
    </>
  );
}