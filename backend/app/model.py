import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import io

print("🔍 Buscando modelo en el sistema...")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "modelo_dental.keras")
model = None

if os.path.exists(MODEL_PATH):
    print(f"✅ Modelo encontrado en: {MODEL_PATH}")
    try:
        model = load_model(MODEL_PATH, compile=False)
        print("🎯 Modelo cargado exitosamente!")
        
        # DEBUG: Ver información del modelo
        print(f"📊 Input shape del modelo: {model.input_shape}")  # Debería ser (None, 224, 224, 3)
        print(f"📊 Output shape del modelo: {model.output_shape}")  # Debería ser (None, 4)
        
    except Exception as e:
        print(f"❌ Error cargando el modelo: {e}")
else:
    print("❌ Modelo no encontrado")

def predict_image(pil_image) -> dict:
    if model is None:
        return {"error": "Modelo no cargado", "diagnosis": "Modelo no disponible", "confidence": 0}
    
    try:
        print(f"🖼️ Imagen original: {pil_image.size} - Modo: {pil_image.mode}")
        
        # CORRECCIÓN IMPORTANTE: Usar 224x224 según el input_shape del modelo
        target_size = (224, 224)  # Cambiado de 128x128 a 224x224
        img = pil_image.resize(target_size)
        print(f"🖼️ Imagen redimensionada: {img.size}")
        
        # Convertir a array
        img_array = image.img_to_array(img)
        print(f"📊 Array shape: {img_array.shape}")
        
        img_array = np.expand_dims(img_array, axis=0)
        print(f"📊 Array expandido: {img_array.shape}")
        
        # Normalización [0, 1]
        img_array_normalized = img_array / 255.0
        
        # Predecir
        print("🔮 Haciendo predicción...")
        preds = model.predict(img_array_normalized, verbose=0)
        print(f"🎯 Predicciones RAW: {preds}")
        
        # Verificar si hay NaN
        if np.isnan(preds).any():
            print("❌ PREDICCIÓN CONTIENE NaN!")
            return {"error": "Predicción inválida (NaN)", "diagnosis": "Error", "confidence": 0}
        
        # Extraer resultados
        class_idx = int(np.argmax(preds, axis=1)[0])
        confidence = float(np.max(preds))
        
        print(f"🎯 Índice de clase: {class_idx}")
        print(f"🎯 Confianza: {confidence:.4f} ({confidence*100:.2f}%)")
        
        # CORRECCIÓN IMPORTANTE: El modelo tiene 4 clases, no 2
        # Ajusta estas clases según tu dataset real del Colab
        classes = ["caries", "diente_sano", "otra_clase_1", "otra_clase_2"]  # 4 clases
        
        if class_idx >= len(classes):
            print(f"❌ Índice de clase inválido: {class_idx}")
            return {"error": f"Índice de clase inválido: {class_idx}", "diagnosis": "Error", "confidence": 0}
        
        diagnosis = classes[class_idx]
        
        print(f"✅ DIAGNÓSTICO FINAL: {diagnosis} - {confidence*100:.2f}%")
        
        return {
            "diagnosis": diagnosis, 
            "confidence": confidence * 100,  # Porcentaje
            "class_index": class_idx
        }
        
    except Exception as e:
        print(f"❌ Error en predict_image: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "diagnosis": "Error en predicción", "confidence": 0}