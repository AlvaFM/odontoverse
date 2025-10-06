from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import predict_image, model  # Importar model también
from PIL import Image
import io

app = FastAPI(title="Odontoverse Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend CITT funcionando"}

@app.get("/test")
def test_endpoint():
    """Endpoint de prueba simple"""
    return {"status": "ok", "message": "Backend funcionando"}

@app.get("/model-info")
def model_info():
    """Endpoint para verificar el estado del modelo"""
    # CORRECCIÓN: Usar la variable model importada
    if model is None:
        return {"status": "error", "message": "Modelo no cargado"}
    
    return {
        "status": "success", 
        "model_loaded": True,
        "model_path": "Cargado correctamente",
        "input_shape": str(model.input_shape),
        "output_shape": str(model.output_shape)
    }

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        print(f"📥 Recibiendo archivo: {file.filename}")
        
        # Leer la imagen
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        print(f"🖼️ Imagen cargada: {img.size}")

        # Obtener diagnóstico
        result = predict_image(img)
        print(f"📤 Enviando resultado: {result}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error en endpoint /predict: {e}")
        return {"error": str(e), "diagnosis": "Error del servidor", "confidence": 0}