import { collection, doc, orderBy, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  deleteDocById,
  listDocs,
  listenDocs,
  updateDocById,
  type WithId,
} from "./firestore.repo";

export type EstadoReserva = "pendiente" | "confirmada" | "sentada" | "cancelada";
export type Sede = "Giráldez" | "Real";

export interface ReservaRow {
  nombre: string;
  tel?: string;
  personas: number;
  fecha: string;
  hora: string;
  sede: Sede;
  zona?: string;
  estado: EstadoReserva;
}

/**
 * Registro sin datos personales (espejo de reservas) para poder calcular
 * aforo desde el cliente sin exponer nombre/teléfono del titular.
 */
export interface AforoRow {
  fecha: string;
  sede: Sede;
  personas: number;
  estado: EstadoReserva;
  reservaId: string;
}

const COL = "reservas";
const COL_AFORO = "reservas_aforo";
const ORDER = [orderBy("createdAt", "desc")];

export type ReservaWithId = WithId<ReservaRow>;
export type AforoWithId = WithId<AforoRow>;

export const reservasRepo = {
  list(): Promise<ReservaWithId[]> {
    return listDocs<ReservaRow>(COL, ORDER);
  },
  listen(cb: (rows: ReservaWithId[]) => void, onError?: (e: unknown) => void): () => void {
    return listenDocs<ReservaRow>(COL, cb, { constraints: ORDER, onError });
  },
  /**
   * Crea la reserva y su espejo de aforo (sin PII) en un solo batch.
   * Así el aforo es legible públicamente pero no expone datos del cliente.
   */
  async createWithAforo(data: ReservaRow): Promise<string> {
    const batch = writeBatch(db);
    const reservaRef = doc(collection(db, COL));
    batch.set(reservaRef, { ...data, createdAt: serverTimestamp() });
    const aforoRef = doc(collection(db, COL_AFORO));
    batch.set(aforoRef, {
      fecha: data.fecha,
      sede: data.sede,
      personas: data.personas,
      estado: data.estado,
      reservaId: reservaRef.id,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
    return reservaRef.id;
  },
  /** Ocupación registrada para una fecha (índice de un solo campo). */
  listAforoByFecha(fecha: string): Promise<AforoWithId[]> {
    return listDocs<AforoRow>(COL_AFORO, [where("fecha", "==", fecha)]);
  },
  updateEstado(id: string, estado: EstadoReserva): Promise<void> {
    return updateDocById(COL, id, { estado });
  },
  remove(id: string): Promise<void> {
    return deleteDocById(COL, id);
  },
};
