import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

// --- Tipos ---

export interface SessionConfig {
  tiempoPorPregunta: number;
  modo: "competitivo" | "aprendizaje";
}

export interface CaseData {
  nombre: string;
  radiografiaUrl: string;
  diagnosticoIA: string;
  confianzaIA: number;
}

export interface Session {
  id?: string;
  codigo: string;
  profesorId: string;
  estado: "esperando" | "jugando" | "finalizada";
  fechaCreacion: any;
  configuracion: SessionConfig;
  casoActual: CaseData;
  preguntaActualIndex?: number; // Para controlar el flujo de preguntas
}

export interface Question {
  id?: string;
  texto: string;
  opciones: string[];
  orden: number;
  tiempoLimite?: number;
  dificultad: "baja" | "media" | "alta";
  explicacion: string;
  respuestaCorrecta?: string; // Solo visible para el profesor o al final
}

export interface Student {
  id?: string;
  nombre: string;
  puntajeTotal: number;
  racha: number;
  fechaIngreso: any;
}

// --- Funciones de Sesión ---

/**
 * Crea una nueva sesión en Firestore
 */
export const createSession = async (
  profesorId: string, 
  caseData: CaseData, 
  config: SessionConfig
): Promise<string> => {
  try {
    // Generar código único de 6 caracteres
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const sessionData: Omit<Session, "id"> = {
      codigo,
      profesorId,
      estado: "esperando",
      fechaCreacion: serverTimestamp(),
      configuracion: config,
      casoActual: caseData,
      preguntaActualIndex: -1 // -1 indica que no ha empezado ninguna pregunta
    };

    const docRef = await addDoc(collection(db, "sesiones"), sessionData);
    return docRef.id;
  } catch (error) {
    console.error("Error creando sesión:", error);
    throw error;
  }
};

/**
 * Busca una sesión por su código
 */
export const getSessionByCode = async (codigo: string): Promise<Session | null> => {
  try {
    const q = query(collection(db, "sesiones"), where("codigo", "==", codigo));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Session;
    }
    return null;
  } catch (error) {
    console.error("Error buscando sesión:", error);
    throw error;
  }
};

/**
 * Une a un alumno a la sesión
 */
export const joinSession = async (sessionId: string, nombreAlumno: string): Promise<string> => {
  try {
    const alumnosRef = collection(db, "sesiones", sessionId, "alumnos");
    
    // Verificar si ya existe un alumno con ese nombre (opcional, por simplicidad permitimos duplicados o se maneja en UI)
    const newStudent: Omit<Student, "id"> = {
      nombre: nombreAlumno,
      puntajeTotal: 0,
      racha: 0,
      fechaIngreso: serverTimestamp()
    };

    const docRef = await addDoc(alumnosRef, newStudent);
    return docRef.id;
  } catch (error) {
    console.error("Error uniéndose a sesión:", error);
    throw error;
  }
};

/**
 * Suscribe a cambios en la sesión (para tiempo real)
 */
export const subscribeToSession = (sessionId: string, callback: (data: Session) => void) => {
  return onSnapshot(doc(db, "sesiones", sessionId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Session);
    }
  });
};

/**
 * Suscribe a la lista de alumnos en tiempo real
 */
export const subscribeToStudents = (sessionId: string, callback: (students: Student[]) => void) => {
  const alumnosRef = collection(db, "sesiones", sessionId, "alumnos");
  return onSnapshot(alumnosRef, (snapshot) => {
    const students: Student[] = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    // Ordenar por puntaje descendente
    students.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
    callback(students);
  });
};

// --- Gestión de Preguntas ---

/**
 * Agrega preguntas a la sesión (usualmente al crearla o en modo profesor)
 */
export const addQuestions = async (sessionId: string, questions: Question[]) => {
  const batch = writeBatch(db);
  const preguntasRef = collection(db, "sesiones", sessionId, "preguntas");
  const respuestasCorrectasRef = collection(db, "sesiones", sessionId, "respuestas_correctas");

  questions.forEach((q, index) => {
    // Crear doc para la pregunta
    const qDocRef = doc(preguntasRef); // ID auto-generado
    const { respuestaCorrecta, ...publicQuestionData } = q;
    
    batch.set(qDocRef, {
      ...publicQuestionData,
      orden: index + 1
    });

    // Guardar respuesta correcta en subcolección separada (o en la misma si simplificamos)
    // Por seguridad, la guardamos en una colección protegida o separada.
    if (respuestaCorrecta) {
      const aDocRef = doc(respuestasCorrectasRef, qDocRef.id);
      batch.set(aDocRef, {
        preguntaId: qDocRef.id,
        respuestaCorrecta
      });
    }
  });

  await batch.commit();
};

/**
 * Obtiene las preguntas de una sesión
 */
export const getQuestions = async (sessionId: string): Promise<Question[]> => {
  const preguntasRef = collection(db, "sesiones", sessionId, "preguntas");
  const snapshot = await getDocs(preguntasRef);
  const questions: Question[] = [];
  snapshot.forEach(doc => questions.push({ id: doc.id, ...doc.data() } as Question));
  return questions.sort((a, b) => a.orden - b.orden);
};

// --- Juego y Respuestas ---

/**
 * Envía una respuesta de un alumno
 */
export const submitAnswer = async (
  sessionId: string, 
  studentId: string, 
  questionId: string, 
  respuesta: string,
  esCorrecta: boolean,
  tiempoTomado: number
) => {
  try {
    const respuestasRef = collection(db, "sesiones", sessionId, "respuestas_alumnos");
    
    // Calcular puntaje (ej. 1000 puntos base - tiempo gastado)
    const puntajeBase = esCorrecta ? 1000 : 0;
    const bonusTiempo = esCorrecta ? Math.max(0, (10 - tiempoTomado) * 50) : 0;
    const puntajeObtenido = puntajeBase + bonusTiempo;

    await runTransaction(db, async (transaction) => {
      // 1. Registrar respuesta
      const newAnswerRef = doc(respuestasRef);
      transaction.set(newAnswerRef, {
        alumnoId: studentId,
        preguntaId: questionId,
        respuestaSeleccionada: respuesta,
        esCorrecta,
        tiempoTomado,
        puntajeObtenido,
        timestamp: serverTimestamp()
      });

      // 2. Actualizar puntaje del alumno
      const alumnoRef = doc(db, "sesiones", sessionId, "alumnos", studentId);
      const alumnoDoc = await transaction.get(alumnoRef);
      
      if (alumnoDoc.exists()) {
        const currentScore = alumnoDoc.data().puntajeTotal || 0;
        const currentStreak = alumnoDoc.data().racha || 0;
        
        transaction.update(alumnoRef, {
          puntajeTotal: currentScore + puntajeObtenido,
          racha: esCorrecta ? currentStreak + 1 : 0
        });
      }
    });

  } catch (error) {
    console.error("Error enviando respuesta:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de la sesión (ej. cambiar de pregunta)
 */
export const updateSessionState = async (
  sessionId: string, 
  newState: Partial<Session>
) => {
  const sessionRef = doc(db, "sesiones", sessionId);
  await updateDoc(sessionRef, newState);
};
