import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export const subirImagen = async (archivo: File) => {
  const nombreArchivo = `imagenes/${Date.now()}_${archivo.name}`;

  const referencia = ref(storage, nombreArchivo);

  await uploadBytes(referencia, archivo);

  const url = await getDownloadURL(referencia);

  return url;
};