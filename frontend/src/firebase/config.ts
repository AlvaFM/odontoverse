import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUltJ63x-mpghhysttRCLghbdyyhBu8-w",
  authDomain: "odontoai-f8be2.firebaseapp.com",
  projectId: "odontoai-f8be2",
  storageBucket: "odontoai-f8be2.appspot.com",
  messagingSenderId: "1010532479351",
  appId: "1:1010532479351:web:42135c3eefec75da847172"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);