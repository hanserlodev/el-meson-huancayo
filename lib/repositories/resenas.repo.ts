import { orderBy } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export type EstadoResena = "pendiente" | "aprobada" | "rechazada";

export interface ResenaRow {
  platoId: string;
  nombre: string;
  rating: number;
  comentario: string;
  estado: EstadoResena;
}

const COL = "resenas";
const ORDER = [orderBy("createdAt", "desc")];

export type ResenaWithId = WithId<ResenaRow>;

export const resenasRepo = {
  list(): Promise<ResenaWithId[]> {
    return listDocs<ResenaRow>(COL);
  },
  listen(cb: (rows: ResenaWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<ResenaRow>(COL, cb, { constraints: ORDER, onError });
  },
  create(data: ResenaRow): Promise<string> {
    return createDoc(COL, data);
  },
  updateEstado(id: string, estado: EstadoResena): Promise<void> {
    return updateDocById(COL, id, { estado });
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
};
