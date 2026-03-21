export const enviarImagenAlModelo = async (archivo: File) => {
  const formData = new FormData();
  formData.append("file", archivo);

  const respuesta = await fetch("http://127.0.0.1:8000/predict/", {
    method: "POST",
    body: formData,
  });

  return await respuesta.json();
};