# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import predict_image, model
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
    return {"message": "Backend funcionando"}

@app.get("/test")
def test_endpoint():
    return {"status": "ok", "message": "Backend funcionando"}

@app.get("/model-info")
def model_info():
    if model is None:
        return {"status": "error", "message": "Modelo no cargado"}
    return {
        "status": "success",
        "model_loaded": True,
        "input_shape": str(model.input_shape),
        "output_shape": str(model.output_shape)
    }

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        result = predict_image(img)
        return result
    except Exception as e:
        print(f"Error en /predict: {e}")
        return {"error": str(e), "diagnosis": "Error del servidor", "confidence": 0}
