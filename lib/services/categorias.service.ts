import { categoriasRepo, type CategoriaRow } from "@/lib/repositories/categorias.repo";
import { parseOrThrow } from "@/lib/schemas/parse";
import { categoriaSchema, categoriaUpdateSchema } from "@/lib/schemas/categoria.schema";

export type CategoriaDoc = CategoriaRow & { id: string };

export const CATEGORIAS_LOCAL: CategoriaDoc[] = [
  { id: "cat-1", nombre: "Brasas", slug: "brasa", orden: 1, activo: true },
  { id: "cat-2", nombre: "Parrillas", slug: "parrilla", orden: 2, activo: true },
  { id: "cat-3", nombre: "Bebidas", slug: "extra", orden: 3, activo: true },
  { id: "cat-4", nombre: "Guarniciones", slug: "extra", orden: 4, activo: true },
];

export async function getCategorias(): Promise<CategoriaDoc[]> {
  try {
    const rows = await categoriasRepo.list();
    return rows.length ? rows : CATEGORIAS_LOCAL;
  } catch {
    return CATEGORIAS_LOCAL;
  }
}

export function subscribeCategorias(cb: (data: CategoriaDoc[]) => void) {
  return categoriasRepo.listen(
    (rows) => cb(rows.length ? rows : CATEGORIAS_LOCAL),
    () => cb(CATEGORIAS_LOCAL)
  );
}

export async function createCategoria(data: Omit<CategoriaDoc, "id">) {
  const safe = parseOrThrow(categoriaSchema, data);
  return categoriasRepo.create(safe);
}

export async function updateCategoria(id: string, data: Partial<CategoriaDoc>) {
  const safe = parseOrThrow(categoriaUpdateSchema, data);
  return categoriasRepo.update(id, safe);
}

export async function deleteCategoria(id: string) {
  return categoriasRepo.remove(id);
}

export async function toggleActivoCategoria(id: string, activo: boolean) {
  return categoriasRepo.toggleActivo(id, activo);
}
