import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Error Notice:', JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with the databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const DEFAULT_CLASS_ID = 'kelas_utama';

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: Client is offline.');
    }
    return false;
  }
}

// Subscribe to real-time changes
export function subscribeToClassData(
  classId: string = DEFAULT_CLASS_ID,
  onData: (data: Partial<AppState>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'classes', classId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppState;
        onData(data);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `classes/${classId}`);
      if (onError) onError(error);
    }
  );
}

// Save / Sync state to Firestore
export async function syncClassStateToFirestore(
  state: AppState,
  classId: string = DEFAULT_CLASS_ID
): Promise<void> {
  const docRef = doc(db, 'classes', classId);
  try {
    const updatedAt = state.updatedAt || new Date().toISOString();
    const payload = {
      classConfig: state.classConfig,
      students: state.students || [],
      jimpitanRecords: state.jimpitanRecords || [],
      transactions: state.transactions || [],
      savingsGoals: state.savingsGoals || [],
      lastBackupDate: state.lastBackupDate || new Date().toISOString(),
      updatedAt,
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `classes/${classId}`);
    throw error;
  }
}
