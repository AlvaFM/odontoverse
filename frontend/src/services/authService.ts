import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebase";

// --- Tipos ---
export interface TeacherProfile {
  uid: string;
  nombre: string;
  email: string;
  fechaRegistro: any;
  sesionesCreadas?: string[];
}

// --- Funciones de Auth ---

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verificar si el profesor ya existe, si no, crearlo
    await saveTeacherProfile(user);
    
    return user;
  } catch (error) {
    console.error("Error en loginWithGoogle:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
};

// --- Gestión de Perfil de Profesor (Colección 'profesores') ---

export const saveTeacherProfile = async (user: User): Promise<void> => {
  const teacherRef = doc(db, "profesores", user.uid);
  const teacherSnap = await getDoc(teacherRef);

  if (!teacherSnap.exists()) {
    // Crear nuevo perfil si no existe
    const newTeacher: TeacherProfile = {
      uid: user.uid,
      nombre: user.displayName || "Docente",
      email: user.email || "",
      fechaRegistro: serverTimestamp(),
      sesionesCreadas: []
    };
    await setDoc(teacherRef, newTeacher);
  }
};

export const getTeacherProfile = async (uid: string): Promise<TeacherProfile | null> => {
  try {
    const teacherRef = doc(db, "profesores", uid);
    const teacherSnap = await getDoc(teacherRef);
    
    if (teacherSnap.exists()) {
      return teacherSnap.data() as TeacherProfile;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    throw error;
  }
};
