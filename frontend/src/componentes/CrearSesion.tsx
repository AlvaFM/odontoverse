import { useState } from "react";
import { supabase } from "../lib/supabase";
import ConfirmarDiagnostico from "./ConfirmarDiagnostico";

import lupaImg from "../assets/img/dientelupa.png";

interface Props {
  codigoSesion: string;
  profesorEmail: string;
  onVolver: () => void;
}

export default function CrearSesion({ codigoSesion, profesorEmail }: Props) {
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [diagnostico, setDiagnostico] = useState("");
  const [confianza, setConfianza] = useState(0);

  const [faseIA, setFaseIA] = useState(false);
  const [analizando, setAnalizando] = useState(false);

  const [continuar, setContinuar] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const enviarImagen = async () => {
    if (!imagen) return;

    setError("");
    setFaseIA(true);
    setAnalizando(true);

    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("file", imagen);

        const res = await fetch("http://127.0.0.1:8000/predict/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        const diagnosticoReal =
          data.prediction || data.diagnostico || "No disponible";

        const confianzaReal =
          data.confidence || data.confianza || 0;

        await supabase.from("casos_clinicos").insert([
          {
            sesion_codigo: codigoSesion,
            imagen_url: "pendiente",
            diagnostico_ml: diagnosticoReal,
            diagnostico_aprobado: false,
          },
        ]);

        setDiagnostico(diagnosticoReal);
        setConfianza(confianzaReal);

        setFaseIA(false);
        setAnalizando(false);
      } catch (e) {
        setError("Error en el análisis");
        setFaseIA(false);
        setAnalizando(false);
      }
    }, 2000);
  };

  if (continuar) {
    return (
      <ConfirmarDiagnostico
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
        confianza={confianza}
        profesorEmail={profesorEmail}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fbfd] px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">

        {/* TITULO */}
        <h2 className="text-xl font-semibold text-[#1e3a5f] text-center mb-6">
          Subir caso clínico
        </h2>

        {/* SESIÓN */}
        <div className="bg-[#f0f8ff] rounded-xl p-3 mb-5 text-center">
          <p className="text-sm text-slate-500">Sesión activa</p>
          <p className="font-semibold text-[#1e3a5f]">{codigoSesion}</p>
        </div>

        {/* UPLOAD */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#9ecbff] rounded-2xl p-6 cursor-pointer bg-[#f7fbfd] hover:bg-[#eef7ff] transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <p className="text-sm text-slate-500">
            Selecciona la imagen para analizar
          </p>
        </label>

        {/* 🧠 LUPA CON RX CIRCULAR */}
        {faseIA && (
          <div className="mt-6 flex justify-center">
            
            <div className="lupa-container">
              <img src={lupaImg} className="w-32 h-32 object-contain" />

              {/* RX SOLO DENTRO DEL CÍRCULO */}
              <div className="rx-circle" />
            </div>
          </div>
        )}

        {/* 🦷 RESULTADO IMAGEN */}
        {preview && !faseIA && (
          <div className="mt-6 relative overflow-hidden rounded-xl">
            <img src={preview} className="w-full rounded-xl" />
          </div>
        )}

        {/* BOTÓN */}
        <button
          onClick={enviarImagen}
          disabled={!imagen || analizando}
          className="mt-5 w-full py-3 rounded-xl bg-[#9ecbff] text-[#1e3a5f] hover:bg-[#81b0d6] transition disabled:opacity-50"
        >
          {analizando ? "Analizando..." : "Analizar imagen"}
        </button>

        {error && (
          <p className="mt-3 text-red-500 text-center">{error}</p>
        )}

        {/* RESULTADO */}
        {!analizando && diagnostico && (
          <div className="mt-6 text-center space-y-3">

            <div className="bg-[#f0f8ff] p-4 rounded-xl">
              <p className="text-sm text-slate-500">Diagnóstico IA</p>
              <p className="font-semibold text-[#1e3a5f]">{diagnostico}</p>
            </div>

            <div className="bg-[#f0f8ff] p-4 rounded-xl">
              <p className="text-sm text-slate-500">Confianza</p>
              <p className="font-semibold text-[#1e3a5f]">{confianza}%</p>
            </div>

            <button
              onClick={() => setContinuar(true)}
              className="w-full py-3 rounded-xl bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2] transition"
            >
              Confirmar diagnóstico
            </button>
          </div>
        )}
      </div>

      {/* 🎯 ESTILOS RX CIRCULAR */}
      <style>
        {`
          .lupa-container {
            position: relative;
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .rx-circle {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
          }

          .rx-circle::before {
            content: "";
            position: absolute;
            width: 200%;
            height: 3px;
            background: rgba(158, 203, 255, 0.9);
            top: 0;
            left: -50%;
            animation: scanCircle 1.2s linear infinite;
            box-shadow: 0 0 10px rgba(158,203,255,0.8);
          }

          @keyframes scanCircle {
            0% { transform: translateY(0); }
            100% { transform: translateY(130px); }
          }
        `}
      </style>
    </div>
  );
}