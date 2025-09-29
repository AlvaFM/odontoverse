from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import predict_image
from PIL import Image
import io

app = FastAPI(title="Odontoverse Backend")

# Permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir al dominio del frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend CITT funcionando"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Leer la imagen
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # Obtener diagnóstico real
    result = predict_image(img)
    return result
