import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { CartItem } from "@/lib/stores/cart";

export type EstadoPedido = "pendiente" | "enHorno" | "enCamino" | "entregado" | "cancelado";

export interface PedidoDoc {
  id: string;
  items: CartItem[];
  subtotal?: number;
  delivery?: number;
  total: number;
  cliente?: { nombre?: string; tel?: string; direccion?: string };
  estado: EstadoPedido;
  createdAt?: unknown;
}

export async function crearPedido(items: CartItem[], total: number, cliente?: PedidoDoc["cliente"]) {
  if (!items.length) throw new Error("El carrito está vacío");
  return addDoc(collection(db, "pedidos"), {
    items, total, cliente: cliente || null, estado: "pendiente" as EstadoPedido, createdAt: serverTimestamp(),
  });
}

export function subscribePedidos(cb: (data: PedidoDoc[]) => void) {
  try {
    return onSnapshot(query(collection(db, "pedidos"), orderBy("createdAt", "desc")), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PedidoDoc, "id">) })));
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

export async function getPedidos(): Promise<PedidoDoc[]> {
  const snap = await getDocs(query(collection(db, "pedidos"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PedidoDoc, "id">) }));
}

export async function updateEstadoPedido(id: string, estado: EstadoPedido) {
  return updateDoc(doc(db, "pedidos", id), { estado });
}
export async function deletePedido(id: string) { return deleteDoc(doc(db, "pedidos", id)); }
