import { where } from "firebase/firestore";
import {
  createDoc,
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export type TipoOferta = "martes" | "combo" | "delivery" | "descuento";

export interface OfertaRow {
  titulo: string;
  descripcion: string;
  tipo: TipoOferta;
  platoId?: string;
  descuento?: number;
  precioOferta?: number;
  fechaIni?: string;
  fechaFin?: string;
  activo: boolean;
}

const COL = "ofertas";

export type OfertaWithId = WithId<OfertaRow>;

export const ofertasRepo = {
  list(): Promise<OfertaWithId[]> {
    return listDocs<OfertaRow>(COL);
  },
  listen(
    cb: (rows: OfertaWithId[]) => void,
    soloActivas = false,
    onError?: (e: unknown) => void
  ): () => void {
    const constraints = soloActivas ? [where("activo", "==", true)] : [];
    return listenDocs<OfertaRow>(COL, cb, { constraints, onError });
  },
  create(data: OfertaRow): Promise<string> {
    return createDoc(COL, data);
  },
  update(id: string, data: Partial<OfertaRow>): Promise<void> {
    return updateDocById(COL, id, data);
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
  toggleActivo(id: string, activo: boolean): Promise<void> {
    return updateDocById(COL, id, { activo });
  },
};
