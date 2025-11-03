# model.py
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image

# Cargar el modelo Keras
try:
    model = load_model("modelo_dental.keras")
    print("✅ Modelo cargado correctamente")
except Exception as e:
    print(f"❌ Error al cargar el modelo: {e}")
    model = None

# Función para procesar la imagen y predecir
def predict_image(img: Image.Image):
    if model is None:
        return {"diagnosis": "Error: modelo no cargado", "confidence": 0}

    try:
        # Preprocesar imagen (ajusta tamaño según tu modelo)
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Realizar predicción
        prediction = model.predict(img_array)
        predicted_class = np.argmax(prediction, axis=1)[0]

        # Supongamos que tus clases son ['Sano', 'Caries', 'Fractura']
        class_names = ['Sano', 'Caries', 'Fractura']
        diagnosis = class_names[predicted_class]
        confidence = float(np.max(prediction))

        return {"diagnosis": diagnosis, "confidence": confidence}

    except Exception as e:
        print(f"❌ Error al predecir: {e}")
        return {"diagnosis": "Error en predicción", "confidence": 0}
