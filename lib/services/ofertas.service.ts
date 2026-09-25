import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type TipoOferta = "martes" | "combo" | "delivery" | "descuento";

export interface OfertaDoc {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoOferta;
  platoId?: string;
  descuento?: number; // %
  precioOferta?: number;
  fechaIni?: string;
  fechaFin?: string;
  activo: boolean;
}

export const OFERTAS_LOCAL: OfertaDoc[] = [
  { id: "of-1", titulo: "Martes de Pollo — S/ 13.90", descripcion: "1/4 pollo + papas + ensalada todos los martes", tipo: "martes", precioOferta: 13.9, activo: true },
  { id: "of-2", titulo: "Combo Familiar S/ 46.90", descripcion: "Pollo entero + gaseosa 1.5L + papas familiares", tipo: "combo", precioOferta: 46.9, activo: true },
  { id: "of-3", titulo: "Delivery Gratis", descripcion: "En pedidos mayores a S/ 35 por Huancayo centro", tipo: "delivery", activo: true },
];

export async function getOfertas(): Promise<OfertaDoc[]> {
  try {
    const snap = await getDocs(collection(db, "ofertas"));
    if (snap.empty) return OFERTAS_LOCAL;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OfertaDoc, "id">) }));
  } catch { return OFERTAS_LOCAL; }
}

export function subscribeOfertas(cb: (data: OfertaDoc[]) => void, soloActivas = false) {
  try {
    const ref = collection(db, "ofertas");
    const q = soloActivas ? query(ref, where("activo", "==", true)) : query(ref);
    return onSnapshot(q, (snap) => {
      if (snap.empty) cb(soloActivas ? OFERTAS_LOCAL.filter((o) => o.activo) : OFERTAS_LOCAL);
      else cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OfertaDoc, "id">) })));
    }, () => cb(soloActivas ? OFERTAS_LOCAL.filter((o) => o.activo) : OFERTAS_LOCAL));
  } catch { cb(OFERTAS_LOCAL); return () => {}; }
}

export async function createOferta(data: Omit<OfertaDoc, "id">) {
  return addDoc(collection(db, "ofertas"), { ...data, createdAt: new Date().toISOString() });
}
export async function updateOferta(id: string, data: Partial<OfertaDoc>) {
  return updateDoc(doc(db, "ofertas", id), data as Record<string, unknown>);
}
export async function deleteOferta(id: string) { return deleteDoc(doc(db, "ofertas", id)); }
export async function toggleActivoOferta(id: string, activo: boolean) { return updateDoc(doc(db, "ofertas", id), { activo }); }
