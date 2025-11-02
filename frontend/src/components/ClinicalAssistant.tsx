import React, { useState, useRef, useEffect } from "react";

interface ClinicalAssistantProps {
  diagnosis: string;
  confidence: number;
  onVolver: () => void;
  onContinuar: () => void;
}

interface Message {
  sender: "bot" | "user";
  text: string;
}

const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({
  diagnosis,
  confidence,
  onVolver,
  onContinuar,
}) => {
  // Cada vez que se monta el componente, los mensajes se reinician
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: `Diagnóstico detectado: ${diagnosis}` },
    { sender: "bot", text: `Nivel de confianza: ${confidence}%` },
    {
      sender: "bot",
      text: "Puedes preguntarme más sobre esta patología o su tratamiento 👇",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  // Función que simula la respuesta del bot
  const simulateBotResponse = (input: string) => {
    setBotTyping(true);
    setTimeout(() => {
      let response = "Lo siento, no tengo información específica sobre eso.";

      if (/tratamiento|terapia|remedio/i.test(input)) {
        response =
          "El tratamiento recomendado incluye restauraciones mínimamente invasivas, control radiográfico y fluoruración localizada.";
      } else if (/prevención|cuidado/i.test(input)) {
        response =
          "Se recomienda higiene oral diaria, visitas periódicas al dentista y uso de selladores en molares para prevenir caries.";
      } else if (/diagnóstico|detectar|caries/i.test(input)) {
        response =
          "Basado en la radiografía, se observa una lesión compatible con caries incipiente en molares superiores.";
      } else {
        response =
          "Interesante pregunta. Se sugiere evaluar clínicamente y correlacionar con la historia dental del paciente.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
      setBotTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Enviar mensaje del usuario
  const handleSend = () => {
    if (!userInput.trim()) return;
    const input = userInput;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setUserInput("");
    simulateBotResponse(input);
  };

  // Quick replies
  const quickReply = (text: string) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    simulateBotResponse(text);
  };

  return (
    <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#034C7D] text-center">
        Asistente Clínico IA
      </h2>

      {/* Chat */}
      <div className="flex flex-col gap-2 h-80 overflow-y-auto border rounded-xl p-3 bg-[#F5FAFF]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-[80%] break-words ${
              msg.sender === "bot"
                ? "bg-[#D6E6F2] text-[#034C7D] self-start"
                : "bg-[#76C7F3] text-white self-end"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {botTyping && (
          <div className="bg-[#D6E6F2] text-[#034C7D] self-start p-2 px-3 rounded-xl animate-pulse">
            El asistente está escribiendo...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 flex-wrap justify-center mt-2">
        <button
          onClick={() => quickReply("Recomiéndame tratamiento")}
          className="bg-[#91D18B] hover:bg-[#75b472] text-white px-4 py-2 rounded-full text-sm"
        >
          Tratamiento
        </button>
        <button
          onClick={() => quickReply("Cómo prevenir esta patología")}
          className="bg-[#F7C948] hover:bg-[#e1c650] text-white px-4 py-2 rounded-full text-sm"
        >
          Prevención
        </button>
        <button
          onClick={() => quickReply("Explica el diagnóstico")}
          className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-4 py-2 rounded-full text-sm"
        >
          Diagnóstico
        </button>
      </div>

      {/* Input y botones */}
      <div className="flex gap-2 mt-2">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Pregunta al asistente..."
          className="flex-1 border rounded-xl p-2"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-[#76C7F3] hover:bg-[#5bb0e0] text-white px-4 py-2 rounded-xl"
        >
          Enviar
        </button>
      </div>

      {/* Volver / Continuar */}
      <div className="flex justify-between mt-4">
        <button
          onClick={onVolver}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl"
        >
          Volver
        </button>
        <button
          onClick={onContinuar}
          className="bg-[#91D18B] hover:bg-[#75b472] text-white px-4 py-2 rounded-xl"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default ClinicalAssistant;
