import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Ruta del modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "modelo_dientes.h5")

# Cargar el modelo directamente, sin recompilar ni custom objects
model = load_model(MODEL_PATH, compile=False)

# Función de predicción
def predict_image(file) -> dict:
    """
    file: imagen recibida desde FastAPI (PIL Image)
    retorna: dict con 'diagnosis' y 'confidence'
    """
    # Redimensionar según entrenamiento
    img = image.load_img(file, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Normalizar igual que en entrenamiento [-1,1]
    img_array = img_array / 127.5 - 1

    # Predecir
    preds = model.predict(img_array)
    class_idx = int(np.argmax(preds, axis=1)[0])
    confidence = float(np.max(preds))

    classes = ["Diente sano", "Caries"]
    diagnosis = classes[class_idx]

    return {"diagnosis": diagnosis, "confidence": confidence}
