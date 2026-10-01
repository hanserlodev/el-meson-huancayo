import {
  reservasRepo,
  type EstadoReserva,
  type ReservaRow,
  type ReservaWithId,
  type Sede,
} from "@/lib/repositories/reservas.repo";
import { AFORO_POR_SEDE } from "@/lib/data";
import { parseOrThrow } from "@/lib/schemas/parse";
import { reservaSchema } from "@/lib/schemas/reserva.schema";

export type { EstadoReserva, Sede };
export type ReservaDoc = ReservaRow & { id: string; createdAt?: unknown };

export interface ReservaInput {
  nombre: string;
  tel?: string;
  personas: number;
  fecha: string;
  hora: string;
  sede?: Sede;
  zona?: string;
}

const ESTADOS_ACTIVOS: EstadoReserva[] = ["pendiente", "confirmada", "sentada"];

function toDoc(r: ReservaWithId): ReservaDoc {
  return { ...r };
}

export async function crearReserva(input: ReservaInput) {
  const data = parseOrThrow(reservaSchema, input);

  // Fecha no pasada — comparación en fecha local (sin shift UTC).
  const [y, m, d] = data.fecha.split("-").map(Number);
  const fechaLocal = new Date(y, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaLocal < hoy) throw new Error("La fecha no puede ser pasada");

  await assertAforoDisponible(data.fecha, data.sede, data.personas);

  return reservasRepo.createWithAforo({
    nombre: data.nombre,
    tel: data.tel ?? "",
    personas: data.personas,
    fecha: data.fecha,
    hora: data.hora,
    sede: data.sede,
    zona: data.zona,
    estado: "confirmada",
  });
}

/**
 * Chequeo de aforo best-effort en cliente.
 *
 * LIMITACIONES (documentadas, no son "tiempo real"):
 * - Es una lectura puntual; entre la consulta y el `createWithAforo` puede
 *   colarse otra reserva (condición de carrera). No sustituye una transacción.
 * - Se lee la colección `reservas_aforo` (espejo sin datos personales), porque
 *   `reservas` solo es legible por admin (ver firestore.rules).
 * - Si la consulta falla (p. ej. reglas sin desplegar) se continúa sin bloquear
 *   la reserva: preferimos no romper el flujo, es una validación suave.
 *
 * Mejora futura: Cloud Function transaccional sobre un documento de aforo.
 */
async function assertAforoDisponible(fecha: string, sede: Sede, personas: number) {
  try {
    const ocupacion = await reservasRepo.listAforoByFecha(fecha);
    const ocupados = ocupacion
      .filter((r) => r.sede === sede && ESTADOS_ACTIVOS.includes(r.estado))
      .reduce((acc, r) => acc + (Number(r.personas) || 0), 0);
    const capacidad = AFORO_POR_SEDE[sede] ?? 0;
    if (ocupados + personas > capacidad) {
      const libres = Math.max(0, capacidad - ocupados);
      throw new Error(
        `Sin aforo disponible en sede ${sede} para esa fecha (quedan ${libres} lugares)`
      );
    }
  } catch (err) {
    // El error de aforo sí debe propagarse; los fallos de lectura se ignoran.
    if (err instanceof Error && err.message.startsWith("Sin aforo")) throw err;
    console.warn("[reservas] chequeo de aforo no disponible, se omite:", err);
  }
}

export function subscribeReservas(cb: (data: ReservaDoc[]) => void) {
  return reservasRepo.listen(
    (rows) => cb(rows.map(toDoc)),
    () => cb([])
  );
}

export async function getReservas(): Promise<ReservaDoc[]> {
  const rows = await reservasRepo.list();
  return rows.map(toDoc);
}

export async function updateEstadoReserva(id: string, estado: EstadoReserva) {
  return reservasRepo.updateEstado(id, estado);
}

export async function deleteReserva(id: string) {
  return reservasRepo.remove(id);
}
