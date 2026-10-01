import { orderBy } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export interface CategoriaRow {
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;
}

const COL = "categorias";
const ORDER = [orderBy("orden")];

export type CategoriaWithId = WithId<CategoriaRow>;

export const categoriasRepo = {
  list(): Promise<CategoriaWithId[]> {
    return listDocs<CategoriaRow>(COL, ORDER);
  },
  listen(cb: (rows: CategoriaWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<CategoriaRow>(COL, cb, { constraints: ORDER, onError });
  },
  create(data: CategoriaRow): Promise<string> {
    return createDoc(COL, data);
  },
  update(id: string, data: Partial<CategoriaRow>): Promise<void> {
    return updateDocById(COL, id, data);
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
  toggleActivo(id: string, activo: boolean): Promise<void> {
    return updateDocById(COL, id, { activo });
  },
};
