import { ofertasRepo, type OfertaRow, type TipoOferta } from "@/lib/repositories/ofertas.repo";
import { parseOrThrow } from "@/lib/schemas/parse";
import { ofertaCreateSchema, ofertaUpdateSchema } from "@/lib/schemas/oferta.schema";

export type { TipoOferta };
export type OfertaDoc = OfertaRow & { id: string };

export const OFERTAS_LOCAL: OfertaDoc[] = [
  { id: "of-1", titulo: "Martes de Pollo — S/ 13.90", descripcion: "1/4 pollo + papas + ensalada todos los martes", tipo: "martes", precioOferta: 13.9, activo: true },
  { id: "of-2", titulo: "Combo Familiar S/ 46.90", descripcion: "Pollo entero + gaseosa 1.5L + papas familiares", tipo: "combo", precioOferta: 46.9, activo: true },
  { id: "of-3", titulo: "Delivery Gratis", descripcion: "En pedidos mayores a S/ 35 por Huancayo centro", tipo: "delivery", activo: true },
];

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
