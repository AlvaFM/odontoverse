import React, { useState, useRef, useEffect } from "react";
import TutorialDental from "./TutorialDental";

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

const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({ diagnosis, confidence, onVolver, onContinuar }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: `Diagnóstico detectado: ${diagnosis}` },
    { sender: "bot", text: `Nivel de confianza: ${confidence}%` },
    { sender: "bot", text: "Puedes preguntarme más sobre esta patología o su tratamiento" },
    { sender: "bot", text: "Si tienes dudas acerca del funcionamiento de la app escribe 'tutorial'" },
  ]);

  const [userInput, setUserInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const simulateBotResponse = (input: string) => {
    if (/tutorial/i.test(input)) {
      setMessages(prev => [...prev, { sender: "bot", text: "¡Genial! Abriendo tutorial interactivo..." }]);
      setTimeout(() => setShowTutorial(true), 800);
      return;
    }

    setBotTyping(true);
    setTimeout(() => {
      let response = "Lo siento, no tengo información específica sobre eso.";
      if (/tratamiento|terapia|remedio/i.test(input)) {
        response = "El tratamiento recomendado incluye restauraciones mínimamente invasivas, control radiográfico y fluoruración localizada.";
      } else if (/prevención|cuidado/i.test(input)) {
        response = "Se recomienda higiene oral diaria, visitas periódicas al dentista y uso de selladores en molares para prevenir caries.";
      } else if (/diagnóstico|detectar|caries/i.test(input)) {
        response = "Basado en la radiografía, se observa una lesión compatible con caries incipiente en molares superiores.";
      }
      setMessages(prev => [...prev, { sender: "bot", text: response }]);
      setBotTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    const input = userInput;
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setUserInput("");
    simulateBotResponse(input);
  };

  const quickReply = (text: string) => {
    setMessages(prev => [...prev, { sender: "user", text }]);
    simulateBotResponse(text);
  };

  return (
    <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-4 relative">
      <h2 className="text-2xl font-bold text-[#034C7D] text-center">Asistente Clínico IA</h2>

      <div className="flex flex-col gap-2 h-80 overflow-y-auto border rounded-xl p-3 bg-[#F5FAFF]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-xl max-w-[80%] break-words ${
            msg.sender === "bot" ? "bg-[#D6E6F2] text-[#034C7D] self-start" : "bg-[#76C7F3] text-white self-end"
          }`}>
            {msg.text}
          </div>
        ))}
        {botTyping && <div className="bg-[#D6E6F2] text-[#034C7D] self-start p-2 px-3 rounded-xl animate-pulse">El asistente está escribiendo...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 flex-wrap justify-center mt-2">
        <button onClick={() => quickReply("Recomiéndame tratamiento")} className="bg-[#91D18B] hover:bg-[#75b472] text-white px-4 py-2 rounded-full text-sm">Tratamiento</button>
        <button onClick={() => quickReply("Cómo prevenir esta patología")} className="bg-[#F7C948] hover:bg-[#e1c650] text-white px-4 py-2 rounded-full text-sm">Prevención</button>
        <button onClick={() => quickReply("Explica el diagnóstico")} className="bg-[#76C7F3] hover:bg-[#5AB0E1] text-white px-4 py-2 rounded-full text-sm">Diagnóstico</button>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Pregunta al asistente..."
          className="flex-1 border rounded-xl p-2"
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="bg-[#76C7F3] hover:bg-[#5bb0e0] text-white px-4 py-2 rounded-xl">Enviar</button>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={onVolver} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl">Volver</button>
        <button onClick={onContinuar} className="bg-[#91D18B] hover:bg-[#75b472] text-white px-4 py-2 rounded-xl">Continuar</button>
      </div>

      {showTutorial && <TutorialDental onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default ClinicalAssistant;
