import { platosRepo } from "@/lib/repositories/platos.repo";
import { uploadPlatoFoto } from "@/lib/repositories/storage.repo";
import { PLATOS as PLATOS_LOCAL, type Plato } from "@/lib/data";
import { parseOrThrow } from "@/lib/schemas/parse";
import { platoCreateSchema, platoUpdateSchema } from "@/lib/schemas/plato.schema";

// Fallback local (BaaS aún sin datos) -> si Firestore vacío, usa PLATOS_LOCAL
const localFiltered = (cat?: string) =>
  PLATOS_LOCAL.filter((p) => !cat || cat === "todos" || p.cat === cat);

// Firestore devuelve los documentos por id; reordenamos según la carta curada.
const POSICION = new Map(PLATOS_LOCAL.map((p, i) => [p.id, i]));
const ordenar = (rows: Plato[]) =>
  [...rows].sort(
    (a, b) => (POSICION.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (POSICION.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );

export async function getPlatos(): Promise<Plato[]> {
  try {
    const rows = await platosRepo.list();
    return rows.length ? ordenar(rows as Plato[]) : PLATOS_LOCAL;
  } catch {
    return PLATOS_LOCAL;
  }
}

export function subscribePlatos(cb: (platos: Plato[]) => void, cat?: string) {
  // Si Firestore tarda o está bloqueado, mostramos el catálogo local sin dejar la carta vacía.
  let entregado = false;
  const respaldo = setTimeout(() => {
    if (!entregado) cb(localFiltered(cat));
  }, 3500);

  const unsub = platosRepo.listen(
    (rows) => {
      entregado = true;
      clearTimeout(respaldo);
      cb(rows.length ? ordenar(rows as Plato[]) : localFiltered(cat));
    },
    cat,
    () => {
      entregado = true;
      clearTimeout(respaldo);
      cb(localFiltered(cat));
    }
  );

  return () => {
    clearTimeout(respaldo);
    unsub();
  };
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
