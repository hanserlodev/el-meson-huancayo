import { limit, where } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export interface CuponRow {
  codigo: string;
  tipo: "porcentaje" | "monto";
  valor: number;
  minimo: number;
  activo: boolean;
  expira?: string;
}

const COL = "cupones";

export type CuponWithId = WithId<CuponRow>;

export const cuponesRepo = {
  list(): Promise<CuponWithId[]> {
    return listDocs<CuponRow>(COL);
  },
  listen(cb: (rows: CuponWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<CuponRow>(COL, cb, { onError });
  },
  async findByCodigo(codigo: string): Promise<CuponWithId | null> {
    const rows = await listDocs<CuponRow>(COL, [where("codigo", "==", codigo), limit(1)]);
    return rows[0] ?? null;
  },
  create(data: CuponRow): Promise<string> {
    return createDoc<CuponRow>(COL, data);
  },
  update(id: string, data: Partial<CuponRow>): Promise<void> {
    return updateDocById(COL, id, data);
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
};
