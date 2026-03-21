import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";

export const guardarSesion = async (
  codigo: string,
  diagnostico: string,
  confianza: number,
  imagenUrl: string
) => {
  await addDoc(collection(db, "Sesiones"), {
    codigo,
    diagnostico,
    confianza,
    imagenUrl,
    creadaEn: new Date()
  });
};