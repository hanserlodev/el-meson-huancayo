import { where } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";
import type { Plato } from "@/lib/data";

const COL = "platos";

export type PlatoRow = WithId<Plato>;

export const platosRepo = {
  list(cat?: string): Promise<PlatoRow[]> {
    const constraints = cat && cat !== "todos" ? [where("cat", "==", cat)] : [];
    return listDocs<Plato>(COL, constraints);
  },
  listen(cb: (rows: PlatoRow[]) => void, cat?: string, onError?: (e: unknown) => void): () => void {
    const constraints = cat && cat !== "todos" ? [where("cat", "==", cat)] : [];
    return listenDocs<Plato>(COL, cb, { constraints, onError });
  },
  create(plato: Plato): Promise<string> {
    return createDoc(COL, plato);
  },
  update(id: string, data: Partial<Plato>): Promise<void> {
    return updateDocById(COL, id, data);
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
  toggleActivo(id: string, activo: boolean): Promise<void> {
    return updateDocById(COL, id, { activo });
  },
};
