
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function TestSupabase() {
  const [imagen, setImagen] = useState<File | null>(null);

  const probarConexion = async () => {
    const { data, error } = await supabase
      .from("sesiones")
      .select("*");

    console.log(data);
    console.log(error);
  };

  const subirImagen = async () => {
    if (!imagen) return;

    const nombreArchivo = `${Date.now()}_${imagen.name}`;

    const { data, error } = await supabase.storage
      .from("imagenes")
      .upload(nombreArchivo, imagen);

    console.log(data);
    console.log(error);
  };

  return (
    <div>
      <button onClick={probarConexion}>
        Probar Supabase
      </button>

      <hr />

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setImagen(e.target.files[0]);
          }
        }}
      />

      <button onClick={subirImagen}>
        Subir imagen
      </button>
    </div>
  );
}

