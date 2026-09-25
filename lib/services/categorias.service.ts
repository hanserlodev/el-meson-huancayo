import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface CategoriaDoc {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;
}

export const CATEGORIAS_LOCAL: CategoriaDoc[] = [
  { id: "cat-1", nombre: "Brasas", slug: "brasa", orden: 1, activo: true },
  { id: "cat-2", nombre: "Parrillas", slug: "parrilla", orden: 2, activo: true },
  { id: "cat-3", nombre: "Bebidas", slug: "extra", orden: 3, activo: true },
  { id: "cat-4", nombre: "Guarniciones", slug: "extra", orden: 4, activo: true },
];

export async function getCategorias(): Promise<CategoriaDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "categorias"), orderBy("orden")));
    if (snap.empty) return CATEGORIAS_LOCAL;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CategoriaDoc, "id">) }));
  } catch { return CATEGORIAS_LOCAL; }
}

export function subscribeCategorias(cb: (data: CategoriaDoc[]) => void) {
  try {
    return onSnapshot(query(collection(db, "categorias"), orderBy("orden")), (snap) => {
      if (snap.empty) cb(CATEGORIAS_LOCAL);
      else cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CategoriaDoc, "id">) })));
    }, () => cb(CATEGORIAS_LOCAL));
  } catch { cb(CATEGORIAS_LOCAL); return () => {}; }
}

export async function createCategoria(data: Omit<CategoriaDoc, "id">) {
  return addDoc(collection(db, "categorias"), { ...data, createdAt: new Date().toISOString() });
}
export async function updateCategoria(id: string, data: Partial<CategoriaDoc>) {
  return updateDoc(doc(db, "categorias", id), data as Record<string, unknown>);
}
export async function deleteCategoria(id: string) { return deleteDoc(doc(db, "categorias", id)); }
export async function toggleActivoCategoria(id: string, activo: boolean) { return updateDoc(doc(db, "categorias", id), { activo }); }
