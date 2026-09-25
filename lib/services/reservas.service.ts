import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type EstadoReserva = "pendiente" | "confirmada" | "sentada" | "cancelada";
export type Sede = "Giráldez" | "Real";
export interface ReservaInput { nombre: string; tel?: string; personas: number; fecha: string; hora: string; sede?: Sede; zona?: string; }
export interface ReservaDoc extends ReservaInput { id: string; estado: EstadoReserva; createdAt?: unknown; }

export async function crearReserva(data: ReservaInput) {
  if (data.nombre.trim().length < 2) throw new Error("Ingresa tu nombre");
  if (!data.fecha) throw new Error("Elige la fecha");
  if (!data.hora) throw new Error("Elige la hora");
  if (data.hora < "11:00" || data.hora > "23:00") throw new Error("Atendemos de 11:00 a 23:00");
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  if (new Date(data.fecha + "T00:00:00") < hoy) throw new Error("La fecha no puede ser pasada");
  if (data.personas < 1 || data.personas > 20) throw new Error("1 a 20 personas");
  return addDoc(collection(db, "reservas"), { ...data, personas: Number(data.personas), sede: data.sede || "Giráldez", estado: "confirmada" as EstadoReserva, createdAt: serverTimestamp() });
}

export function subscribeReservas(cb: (data: ReservaDoc[]) => void) {
  try {
    return onSnapshot(query(collection(db, "reservas"), orderBy("createdAt", "desc")), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReservaDoc, "id">) })));
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

export async function getReservas(): Promise<ReservaDoc[]> {
  const snap = await getDocs(query(collection(db, "reservas"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReservaDoc, "id">) }));
}

export async function updateEstadoReserva(id: string, estado: EstadoReserva) { return updateDoc(doc(db, "reservas", id), { estado }); }
export async function deleteReserva(id: string) { return deleteDoc(doc(db, "reservas", id)); }
