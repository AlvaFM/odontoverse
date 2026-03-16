import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { CaseData } from "./sessionService";

// --- Tipos ---

export interface SavedCase extends CaseData {
  id?: string;
  profesorId: string;
  fechaCreacion: any;
}

// --- Funciones de Casos ---

/**
 * Guarda un caso en la biblioteca del profesor
 */
export const saveCase = async (profesorId: string, caseData: CaseData): Promise<string> => {
  try {
    const newCase: Omit<SavedCase, "id"> = {
      ...caseData,
      profesorId,
      fechaCreacion: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "casos"), newCase);
    return docRef.id;
  } catch (error) {
    console.error("Error guardando caso:", error);
    throw error;
  }
};

/**
 * Obtiene los casos guardados por un profesor
 */
export const getTeacherCases = async (profesorId: string): Promise<SavedCase[]> => {
  try {
    const q = query(collection(db, "casos"), where("profesorId", "==", profesorId));
    const querySnapshot = await getDocs(q);
    
    const cases: SavedCase[] = [];
    querySnapshot.forEach((doc) => {
      cases.push({ id: doc.id, ...doc.data() } as SavedCase);
    });
    
    return cases;
  } catch (error) {
    console.error("Error obteniendo casos:", error);
    throw error;
  }
};
