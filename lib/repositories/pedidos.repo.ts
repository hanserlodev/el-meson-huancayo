import { orderBy } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export type EstadoPedido = "pendiente" | "enHorno" | "enCamino" | "entregado" | "cancelado";

export interface PedidoRow {
  items: { nombre: string; precio: number; cant: number }[];
  subtotal?: number;
  delivery?: number;
  total: number;
  cliente?: { nombre?: string; tel?: string; direccion?: string } | null;
  estado: EstadoPedido;
}

const COL = "pedidos";
const ORDER = [orderBy("createdAt", "desc")];

export type PedidoWithId = WithId<PedidoRow>;

export const pedidosRepo = {
  list(): Promise<PedidoWithId[]> {
    return listDocs<PedidoRow>(COL, ORDER);
  },
  listen(cb: (rows: PedidoWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<PedidoRow>(COL, cb, { constraints: ORDER, onError });
  },
  create(data: PedidoRow): Promise<string> {
    return createDoc(COL, data);
  },
  updateEstado(id: string, estado: EstadoPedido): Promise<void> {
    return updateDocById(COL, id, { estado });
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
};
