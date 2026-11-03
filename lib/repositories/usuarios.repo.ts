import {
  getDocById,
  listDocs,
  listenDocById,
  setDocById,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export interface UsuarioRow {
  nombre: string;
  email: string;
  telefono?: string;
  direcciones?: {
    id: string;
    alias: string;
    direccion: string;
    referencia?: string;
    principal?: boolean;
  }[];
  rol: "cliente" | "admin";
  creadoEn?: string;
}

const COL = "usuarios";

export type UsuarioWithId = WithId<UsuarioRow>;

export const usuariosRepo = {
  get(uid: string): Promise<UsuarioWithId | null> {
    return getDocById<UsuarioRow>(COL, uid);
  },
  create(uid: string, data: UsuarioRow): Promise<void> {
    return setDocById<UsuarioRow>(COL, uid, data, { timestamps: false });
  },
  update(uid: string, data: Partial<UsuarioRow>): Promise<void> {
    return updateDocById(COL, uid, data);
  },
  listen(
    uid: string,
    cb: (row: UsuarioWithId | null) => void,
    onError?: (e: unknown) => void
  ): () => void {
    return listenDocById<UsuarioRow>(COL, uid, cb, onError);
  },
  list(): Promise<UsuarioWithId[]> {
    return listDocs<UsuarioRow>(COL);
  },
};
