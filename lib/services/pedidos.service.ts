import {
  pedidosRepo,
  type EstadoPedido,
  type PedidoRow,
  type PedidoWithId,
} from "@/lib/repositories/pedidos.repo";
import type { CartItem } from "@/lib/stores/cart";
import { parseOrThrow } from "@/lib/schemas/parse";
import { pedidoSchema } from "@/lib/schemas/pedido.schema";

export type { EstadoPedido };
export type PedidoDoc = PedidoRow & { id: string; createdAt?: unknown };

function toDoc(p: PedidoWithId): PedidoDoc {
  return { ...p };
}

export async function crearPedido(items: CartItem[], total: number, cliente?: PedidoRow["cliente"]) {
  const data = parseOrThrow(pedidoSchema, { items, total, cliente });

  // NOTA: esto corre en el navegador; es un soft-check disuasorio, NO una
  // validación server-side. Un cliente manipulado puede enviar otro `total`.
  // Mejora futura: Cloud Function que recalcule el total desde `platos`.
  const subtotalCalc = data.items.reduce((a, i) => a + i.precio * i.cant, 0);
  if (Math.abs(subtotalCalc - data.total) > 20 && data.total < subtotalCalc) {
    throw new Error("Total no coincide con items (posible manipulación)");
  }

  return pedidosRepo.create({
    items: data.items,
    total: data.total,
    cliente: data.cliente
      ? {
          nombre: data.cliente.nombre ?? "",
          tel: data.cliente.tel ?? "",
          direccion: data.cliente.direccion ?? "",
        }
      : null,
    estado: "pendiente",
  });
}

export function subscribePedidos(cb: (data: PedidoDoc[]) => void) {
  return pedidosRepo.listen(
    (rows) => cb(rows.map(toDoc)),
    () => cb([])
  );
}

export async function getPedidos(): Promise<PedidoDoc[]> {
  const rows = await pedidosRepo.list();
  return rows.map(toDoc);
}

export async function updateEstadoPedido(id: string, estado: EstadoPedido) {
  return pedidosRepo.updateEstado(id, estado);
}

export async function deletePedido(id: string) {
  return pedidosRepo.remove(id);
}
