# model.py
import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image

print("🔍 Buscando modelo en el sistema...")

# Ruta absoluta hacia el archivo del modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "modelo_dental.keras")

model = None

# Verificar existencia del modelo
if os.path.exists(MODEL_PATH):
    print(f"✅ Modelo encontrado en: {MODEL_PATH}")
    try:
        model = load_model(MODEL_PATH, compile=False)
        print("🎯 Modelo cargado exitosamente!")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📊 Output shape: {model.output_shape}")
    except Exception as e:
        print(f"❌ Error cargando el modelo: {e}")
else:
    print(f"❌ Modelo no encontrado en {MODEL_PATH}")
    model = None


# ===============================
# Función de predicción
# ===============================
def predict_image(img: Image.Image) -> dict:
    if model is None:
        return {"error": "Modelo no cargado", "diagnosis": "Modelo no disponible", "confidence": 0}

    try:
        print(f"🖼️ Imagen original: {img.size} - Modo: {img.mode}")
        
        # Redimensionar según el input del modelo
        target_size = (224, 224)
        img = img.resize(target_size)
        print(f"🖼️ Imagen redimensionada: {img.size}")
        
        # Convertir a array normalizado
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        print(f"📊 Array preparado: {img_array.shape}")
        
        # Realizar predicción
        print("🔮 Realizando predicción...")
        preds = model.predict(img_array, verbose=0)
        print(f"🎯 Predicciones RAW: {preds}")
        
        if np.isnan(preds).any():
            return {"error": "Predicción inválida (NaN)", "diagnosis": "Error", "confidence": 0}
        
        # Extraer resultado más probable
        class_idx = int(np.argmax(preds, axis=1)[0])
        confidence = float(np.max(preds))
        
        # Mapeo de clases a nombres legibles
        class_mapping = {
            "caries": "Caries dental",
            "diente_sano": "Diente sano",
            "otra_clase_1": "Patología dental",
            "otra_clase_2": "Otra condición"
        }
        
        # Obtener la etiqueta de la clase
        classes = list(class_mapping.keys())
        if class_idx >= len(classes):
            return {"error": f"Índice inválido: {class_idx}", "diagnosis": "Error", "confidence": 0}
        
        # Obtener el diagnóstico y formatear la confianza
        diagnosis_key = classes[class_idx]
        diagnosis = class_mapping.get(diagnosis_key, "Condición dental")
        confidence_formatted = round(float(confidence) * 100, 2)  # Redondear a 2 decimales
        
        print(f"✅ Diagnóstico: {diagnosis} ({confidence_formatted}%)")
        
        return {
            "diagnosis": diagnosis,
            "confidence": confidence_formatted,
            "class_index": class_idx,
            "raw_diagnosis": diagnosis_key  # Para referencia interna si es necesario
        }
    
    except Exception as e:
        print(f"❌ Error en predict_image: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "diagnosis": "Error en predicción", "confidence": 0}
