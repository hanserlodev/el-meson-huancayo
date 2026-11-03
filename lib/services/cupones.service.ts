import { cuponesRepo, type CuponWithId } from "@/lib/repositories/cupones.repo";
import { cuponSchema, type CuponInput } from "@/lib/schemas/cupon.schema";
import { parseOrThrow } from "@/lib/schemas/parse";

export type CuponDoc = CuponWithId;

export async function listarCupones(): Promise<CuponDoc[]> {
  const rows = await cuponesRepo.list();
  return rows.sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export function suscribirCupones(
  cb: (rows: CuponDoc[]) => void,
  onError?: (e: unknown) => void
): () => void {
  return cuponesRepo.listen((rows) => cb([...rows].sort((a, b) => a.codigo.localeCompare(b.codigo))), onError);
}

export async function crearCupon(data: CuponInput): Promise<void> {
  const safe = parseOrThrow(cuponSchema, data);
  await cuponesRepo.create({ ...safe, minimo: safe.minimo ?? 0 });
}

export async function actualizarCupon(id: string, data: Partial<CuponInput>): Promise<void> {
  await cuponesRepo.update(id, data);
}

export async function borrarCupon(id: string): Promise<void> {
  await cuponesRepo.remove(id);
}

/** Busca un cupón por su código (sin distinguir mayúsculas). */
export async function buscarCupon(codigo: string): Promise<CuponDoc | null> {
  const normalizado = codigo.trim().toUpperCase();
  if (!normalizado) return null;
  return cuponesRepo.findByCodigo(normalizado);
}
