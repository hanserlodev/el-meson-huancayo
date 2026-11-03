import { ofertasRepo, type OfertaRow, type TipoOferta } from "@/lib/repositories/ofertas.repo";
import { parseOrThrow } from "@/lib/schemas/parse";
import { ofertaCreateSchema, ofertaUpdateSchema } from "@/lib/schemas/oferta.schema";
import { OFERTAS_LOCAL as OFERTAS_BASE } from "@/lib/ofertas-local";

export type { TipoOferta };
export type OfertaDoc = OfertaRow & { id: string };

export const OFERTAS_LOCAL: OfertaDoc[] = OFERTAS_BASE;

export async function getOfertas(): Promise<OfertaDoc[]> {
  try {
    const rows = await ofertasRepo.list();
    return rows.length ? rows : OFERTAS_LOCAL;
  } catch {
    return OFERTAS_LOCAL;
  }
}

export function subscribeOfertas(cb: (data: OfertaDoc[]) => void, soloActivas = false) {
  const local = () => (soloActivas ? OFERTAS_LOCAL.filter((o) => o.activo) : OFERTAS_LOCAL);
  return ofertasRepo.listen(
    (rows) => cb(rows.length ? rows : local()),
    soloActivas,
    () => cb(local())
  );
}

export async function createOferta(data: Omit<OfertaDoc, "id">) {
  const safe = parseOrThrow(ofertaCreateSchema, data);
  return ofertasRepo.create(safe);
}

export async function updateOferta(id: string, data: Partial<OfertaDoc>) {
  const safe = parseOrThrow(ofertaUpdateSchema, data);
  return ofertasRepo.update(id, safe);
}

export async function deleteOferta(id: string) {
  return ofertasRepo.remove(id);
}

export async function toggleActivoOferta(id: string, activo: boolean) {
  return ofertasRepo.toggleActivo(id, activo);
}
