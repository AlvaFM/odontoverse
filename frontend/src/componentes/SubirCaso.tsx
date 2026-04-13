import { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ConfirmarDiagnostico from "./ConfirmarDiagnostico";

import uploadIcon from "../assets/img/upload.svg";
import dienteLupa from "../assets/img/dientelupa.png";

interface Props {
  codigoSesion: string;
  profesorEmail: string;
  onVolver: () => void;
}

export default function SubirCaso({
  codigoSesion,
  profesorEmail,
  onVolver,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [diagnostico, setDiagnostico] = useState("");
  const [confianza, setConfianza] = useState(0);

  const [analizado, setAnalizado] = useState(false);
  const [continuar, setContinuar] = useState(false);

  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [mostrarScanner, setMostrarScanner] = useState(false);

  useEffect(() => {
    let interval: any;

    if (subiendo) {
      setProgreso(10);

      interval = setInterval(() => {
        setProgreso((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setProgreso(0);
    }

    return () => clearInterval(interval);
  }, [subiendo]);

  const enviarImagen = async () => {
    if (!imagen) return;

    setSubiendo(true);
    setMostrarScanner(true);
    setError("");

    const formData = new FormData();
    formData.append("file", imagen);

    const respuesta = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      body: formData,
    });

    const data = await respuesta.json();

    const diagnosticoReal =
      data.prediction ||
      data.diagnostico ||
      data.resultado ||
      "Diagnóstico no disponible";

    const confianzaReal =
      data.confidence ||
      data.confianza ||
      data.porcentaje ||
      0;

    const { error: dbError } = await supabase.from("casos_clinicos").insert([
      {
        sesion_codigo: codigoSesion,
        imagen_url: "pendiente",
        diagnostico_ml: diagnosticoReal,
        diagnostico_aprobado: false,
      },
    ]);

    if (dbError) {
      setError("Error al guardar: " + dbError.message);
      setSubiendo(false);
      setMostrarScanner(false);
      return;
    }

    setDiagnostico(diagnosticoReal);
    setConfianza(confianzaReal);

    setAnalizado(true);
    setSubiendo(false);

    setTimeout(() => {
      setMostrarScanner(false);
    }, 1200);
  };

  if (continuar) {
    return (
      <ConfirmarDiagnostico
        codigoSesion={codigoSesion}
        diagnostico={diagnostico}
        confianza={confianza}
        profesorEmail={profesorEmail}
        onVolver={onVolver}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100">
      
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-700">
          Subir caso clínico
        </h1>
        <p className="text-slate-500 mt-2">
          Sube una imagen para análisis del modelo
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onVolver}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition"
          >
            Volver
          </button>

          <span className="text-xs text-slate-500">
            Sesión: {codigoSesion}
          </span>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);

            const file = e.dataTransfer.files?.[0];
            if (file) {
              setImagen(file);
              setPreview(URL.createObjectURL(file));
            }
          }}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-[#cfeaf6] bg-[#f7fbfd] hover:bg-[#eef7fc]"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              className="w-full max-h-48 object-contain rounded-lg mb-3"
            />
          ) : (
            <img
              src={uploadIcon}
              className="w-14 h-14 mb-3 opacity-70"
            />
          )}

          <p className="text-slate-600 font-medium text-center">
            Haz clic o arrastra una imagen aquí
          </p>

          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG o JPEG
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImagen(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        <button
          onClick={enviarImagen}
          disabled={subiendo || imagen === null}
          className={`w-full mt-5 py-3 rounded-xl transition font-medium ${
            subiendo
              ? "bg-blue-400 text-white"
              : "bg-[#cfeaf6] text-[#1e3a5f] hover:bg-[#b9e0f2]"
          } disabled:opacity-50`}
        >
          {subiendo ? "Analizando..." : "Analizar imagen"}
        </button>

        {subiendo && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-200"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Analizando imagen... {Math.round(progreso)}%
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 mt-3 text-sm text-center">{error}</p>
        )}

        {analizado && (
          <div className="mt-6 space-y-3 text-center">
            <div className="bg-[#f0f8ff] rounded-xl p-4">
              <p className="text-xs text-slate-500">Diagnóstico</p>
              <p className="font-semibold text-[#1e3a5f]">
                {diagnostico}
              </p>
            </div>

            <div className="bg-[#f0f8ff] rounded-xl p-4">
              <p className="text-xs text-slate-500">Confianza</p>
              <p className="font-semibold text-[#1e3a5f]">
                {confianza}%
              </p>
            </div>

            <button
              onClick={() => setContinuar(true)}
              className="w-full py-3 rounded-xl bg-[#dcebf7] text-[#1e3a5f] hover:bg-[#cfe3f3] transition"
            >
              Confirmar diagnóstico
            </button>
          </div>
        )}
      </div>

      {mostrarScanner && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
          <div className="relative flex items-center justify-center">

            {/* DIENTE */}
           <img
              src={dienteLupa}
              className="w-[100px] h-[100px] object-contain z-10"
            />

          {/* SCANNER VERTICAL */}
            <div className="absolute w-[140px] h-[140px] overflow-hidden z-30">
              <div className="relative w-full h-full">
                <div className="absolute w-full h-[2px] bg-blue-400/80 animate-scan-line z-50" />
              </div>
            </div>

            {/* GLOW */}
            <div className="absolute w-[180px] h-[180px] bg-blue-400/20 blur-xl rounded-full animate-pulse" />

          </div>
        </div>
      )}
    </div>
  );
}