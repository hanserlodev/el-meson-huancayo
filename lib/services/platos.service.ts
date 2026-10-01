import { platosRepo } from "@/lib/repositories/platos.repo";
import { uploadPlatoFoto } from "@/lib/repositories/storage.repo";
import { PLATOS as PLATOS_LOCAL, type Plato } from "@/lib/data";
import { parseOrThrow } from "@/lib/schemas/parse";
import { platoCreateSchema, platoUpdateSchema } from "@/lib/schemas/plato.schema";

// Fallback local (BaaS aún sin datos) -> si Firestore vacío, usa PLATOS_LOCAL
const localFiltered = (cat?: string) =>
  PLATOS_LOCAL.filter((p) => !cat || cat === "todos" || p.cat === cat);

export async function getPlatos(): Promise<Plato[]> {
  try {
    const rows = await platosRepo.list();
    return rows.length ? (rows as Plato[]) : PLATOS_LOCAL;
  } catch {
    return PLATOS_LOCAL;
  }
}

export function subscribePlatos(cb: (platos: Plato[]) => void, cat?: string) {
  return platosRepo.listen(
    (rows) => cb(rows.length ? (rows as Plato[]) : localFiltered(cat)),
    cat,
    () => cb(localFiltered(cat))
  );
}

export async function createPlato(plato: Plato) {
  const p = parseOrThrow(platoCreateSchema, plato);
  return platosRepo.create({
    id: p.id ?? `plato-${Date.now()}`,
    nombre: p.nombre,
    precio: p.precio,
    cat: p.cat,
    desc: p.desc,
    img: p.img,
    tag: p.tag,
    rating: p.rating,
    votos: p.votos,
    activo: p.activo,
  });
}

export async function updatePlato(id: string, data: Partial<Plato>) {
  const safe = parseOrThrow(platoUpdateSchema, data);
  return platosRepo.update(id, safe);
}

export async function deletePlato(id: string) {
  return platosRepo.remove(id);
}

export async function toggleActivoPlato(id: string, activo: boolean) {
  return platosRepo.toggleActivo(id, activo);
}

export { uploadPlatoFoto };
