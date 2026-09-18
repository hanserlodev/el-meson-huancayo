import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { CartItem } from "@/lib/stores/cart";

export async function crearPedido(items: CartItem[], total: number) {
  if (!items.length) throw new Error("El carrito está vacío");
  return addDoc(collection(db, "pedidos"), {
    items,
    total,
    estado: "pendiente",
    createdAt: serverTimestamp(),
  });
}
