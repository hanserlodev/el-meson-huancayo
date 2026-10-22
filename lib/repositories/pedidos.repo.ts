import { collection, doc, orderBy, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  createDoc,
  deleteDocById,
  getDocById,
  listDocs,
  listenDocById,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export type EstadoPedido = "pendiente" | "enHorno" | "enCamino" | "entregado" | "cancelado";
export type ModoEntrega = "delivery" | "pickup";

export interface PedidoRow {
  /** Código público de seguimiento (los pedidos antiguos no lo tienen). */
  codigo?: string;
  items: { nombre: string; precio: number; cant: number }[];
  subtotal?: number;
  delivery?: number;
  modo?: ModoEntrega;
  pago?: string;
  notas?: string;
  total: number;
  cliente?: { nombre?: string; tel?: string; direccion?: string } | null;
  estado: EstadoPedido;
}

/**
 * Espejo público de un pedido, SIN datos personales.
 * El ID del documento es el propio `codigo`, y solo se puede leer por ID
 * (`get`), nunca listar, para que no se puedan enumerar pedidos.
 */
export interface SeguimientoRow {
  codigo: string;
  estado: EstadoPedido;
  total: number;
  items: { nombre: string; cant: number }[];
  fecha: string;
  modo?: ModoEntrega;
}

const COL = "pedidos";
const COL_SEGUIMIENTO = "pedidos_seguimiento";
const ORDER = [orderBy("createdAt", "desc")];

export type PedidoWithId = WithId<PedidoRow>;
export type SeguimientoWithId = WithId<SeguimientoRow>;

export const pedidosRepo = {
  list(): Promise<PedidoWithId[]> {
    return listDocs<PedidoRow>(COL, ORDER);
  },
  listen(cb: (rows: PedidoWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<PedidoRow>(COL, cb, { constraints: ORDER, onError });
  },
  create(data: PedidoRow): Promise<string> {
    return createDoc<PedidoRow>(COL, data);
  },
  /**
   * Crea el pedido y su espejo público (sin PII) en un solo batch.
   * Si el código ya existe, las reglas impiden el update anónimo del espejo
   * y el batch falla: nunca se sobrescribe el seguimiento de otro cliente.
   */
  async createWithSeguimiento(data: PedidoRow, codigo?: string): Promise<string> {
    const batch = writeBatch(db);
    const pedidoRef = doc(collection(db, COL));
    batch.set(pedidoRef, { ...data, codigo: codigo ?? null, createdAt: serverTimestamp() });

    if (codigo) {
      batch.set(doc(db, COL_SEGUIMIENTO, codigo), {
        codigo,
        estado: data.estado,
        total: data.total,
        items: data.items.map((i) => ({ nombre: i.nombre, cant: i.cant })),
        fecha: new Date().toISOString(),
        modo: data.modo ?? "delivery",
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return pedidoRef.id;
  },
  getSeguimiento(codigo: string): Promise<SeguimientoWithId | null> {
    return getDocById<SeguimientoRow>(COL_SEGUIMIENTO, codigo);
  },
  listenSeguimiento(
    codigo: string,
    cb: (row: SeguimientoWithId | null) => void,
    onError?: (e: unknown) => void
  ): () => void {
    return listenDocById<SeguimientoRow>(COL_SEGUIMIENTO, codigo, cb, onError);
  },
  /** Actualiza el pedido y su espejo público. Si el espejo no existe, igual guarda el pedido. */
  async updateEstadoConSeguimiento(id: string, estado: EstadoPedido, codigo?: string): Promise<void> {
    const batch = writeBatch(db);
    batch.update(doc(db, COL, id), { estado });
    if (codigo) batch.update(doc(db, COL_SEGUIMIENTO, codigo), { estado });

    try {
      await batch.commit();
    } catch (err) {
      if (!codigo) throw err;
      console.warn("[pedidos] no se pudo actualizar el seguimiento, se actualiza solo el pedido:", err);
      await updateDocById(COL, id, { estado });
    }
  },
  updateEstado(id: string, estado: EstadoPedido): Promise<void> {
    return updateDocById(COL, id, { estado });
  },
  /** Borra el pedido y su espejo (evita seguimientos huérfanos). */
  async removeWithSeguimiento(id: string, codigo?: string): Promise<void> {
    if (!codigo) return deleteDocById(COL, id);

    const batch = writeBatch(db);
    batch.delete(doc(db, COL, id));
    batch.delete(doc(db, COL_SEGUIMIENTO, codigo));
    try {
      await batch.commit();
    } catch (err) {
      console.warn("[pedidos] no se pudo borrar el seguimiento, se borra solo el pedido:", err);
      await deleteDocById(COL, id);
    }
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
};
