// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUltJ63x-mpghhysttRCLghbdyyhBu8-w",
  authDomain: "odontoai-f8be2.firebaseapp.com",
  projectId: "odontoai-f8be2",
  storageBucket: "odontoai-f8be2.firebasestorage.app",
  messagingSenderId: "1010532479351",
  appId: "1:1010532479351:web:42135c3eefec75da847172"
};

// Inicializa Firebase (solo una vez)
const app = initializeApp(firebaseConfig);

// Exporta las instancias para usarlas en otros archivos
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
