/**
 * Capa de acceso a datos (repositorio) sobre Cloud Firestore.
 * Es el ÚNICO módulo que importa el SDK de `firebase/firestore`.
 * Los `lib/services/*.service.ts` consumen estas funciones y no conocen el SDK.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

/** Documento Firestore con su id ya resuelto. */
export type WithId<T> = T & { id: string };

/**
 * Crea un documento. Agrega `createdAt` con `serverTimestamp()` por defecto
 * para no filtrar detalles de Firestore hacia los servicios.
 */
export async function createDoc<T extends DocumentData>(
  colName: string,
  data: T,
  opts: { timestamps?: boolean } = {}
): Promise<string> {
  const payload = opts.timestamps === false ? data : { ...data, createdAt: serverTimestamp() };
  const ref = await addDoc(collection(db, colName), payload);
  return ref.id;
}

export async function updateDocById(
  colName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, colName, id), data);
}

export async function deleteDocById(colName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, colName, id));
}

export async function listDocs<T>(
  colName: string,
  constraints: QueryConstraint[] = []
): Promise<WithId<T>[]> {
  const snap = await getDocs(query(collection(db, colName), ...constraints));
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
}

export interface ListenOptions {
  constraints?: QueryConstraint[];
  onError?: (error: unknown) => void;
}

/**
 * Suscripción en tiempo real a una colección.
 * Devuelve la función de baja (`unsubscribe`).
 */
export function listenDocs<T>(
  colName: string,
  cb: (rows: WithId<T>[]) => void,
  opts: ListenOptions = {}
): () => void {
  const { constraints = [], onError } = opts;
  return onSnapshot(
    query(collection(db, colName), ...constraints),
    (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }))),
    (err) => onError?.(err)
  );
}

/**
 * Crea/reemplaza un documento con un ID elegido por la aplicación.
 * Útil para espejos públicos donde el ID es el propio código de consulta.
 */
export async function setDocById<T extends DocumentData>(
  colName: string,
  id: string,
  data: T,
  opts: { timestamps?: boolean } = {}
): Promise<void> {
  const payload = opts.timestamps === false ? data : { ...data, createdAt: serverTimestamp() };
  await setDoc(doc(db, colName, id), payload);
}

/** Lee un documento por ID. Devuelve `null` si no existe. */
export async function getDocById<T>(
  colName: string,
  id: string
): Promise<WithId<T> | null> {
  const snap = await getDoc(doc(db, colName, id));
  if (!snap.exists()) return null;
  return { ...(snap.data() as T), id: snap.id };
}

/** Suscripción en tiempo real a un documento por ID. */
export function listenDocById<T>(
  colName: string,
  id: string,
  cb: (row: WithId<T> | null) => void,
  onError?: (error: unknown) => void
): () => void {
  return onSnapshot(
    doc(db, colName, id),
    (snap) => cb(snap.exists() ? { ...(snap.data() as T), id: snap.id } : null),
    (err) => onError?.(err)
  );
}
