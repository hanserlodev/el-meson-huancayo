import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type EstadoResena = "pendiente" | "aprobada" | "rechazada";

export interface ResenaDoc {
  id: string;
  platoId: string;
  nombre: string;
  rating: number; // 1-5
  comentario: string;
  estado: EstadoResena;
  createdAt?: unknown;
}

export async function crearResena(data: Omit<ResenaDoc, "id" | "estado" | "createdAt">) {
  if (!data.platoId) throw new Error("Selecciona un plato");
  if (data.nombre.trim().length < 2) throw new Error("Ingresa tu nombre");
  if (data.rating < 1 || data.rating > 5) throw new Error("Rating 1 a 5");
  if (data.comentario.trim().length < 5) throw new Error("Comentario muy corto");
  const { serverTimestamp } = await import("firebase/firestore");
  return addDoc(collection(db, "resenas"), { ...data, estado: "pendiente" as EstadoResena, createdAt: serverTimestamp() });
}

export function subscribeResenas(cb: (data: ResenaDoc[]) => void, platoId?: string, soloAprobadas = false) {
  try {
    let q = query(collection(db, "resenas"), orderBy("createdAt", "desc"));
    // filtros compuestos requieren índices; fallback client-side si falla
    return onSnapshot(q, (snap) => {
      let arr = snap.empty ? [] : snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResenaDoc, "id">) }));
      if (platoId) arr = arr.filter((r) => r.platoId === platoId);
      if (soloAprobadas) arr = arr.filter((r) => r.estado === "aprobada");
      cb(arr);
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

export async function getResenasAprobadas(platoId?: string): Promise<ResenaDoc[]> {
  try {
    const snap = await getDocs(collection(db, "resenas"));
    let arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResenaDoc, "id">) }));
    arr = arr.filter((r) => r.estado === "aprobada");
    if (platoId) arr = arr.filter((r) => r.platoId === platoId);
    return arr;
  } catch { return []; }
}

export async function updateEstadoResena(id: string, estado: EstadoResena) {
  return updateDoc(doc(db, "resenas", id), { estado });
}
export async function deleteResena(id: string) { return deleteDoc(doc(db, "resenas", id)); }
