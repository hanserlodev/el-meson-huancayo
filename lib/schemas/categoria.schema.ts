import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre categoría requerido").max(60, "Nombre muy largo"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug inválido (a-z0-9-)")
    .max(40, "Slug muy largo"),
  orden: z.number().int("Orden 1-100").min(1, "Orden 1-100").max(100, "Orden 1-100"),
  activo: z.boolean(),
});

export const categoriaUpdateSchema = categoriaSchema.partial();

export type CategoriaInput = z.infer<typeof categoriaSchema>;
export type CategoriaUpdateInput = z.infer<typeof categoriaUpdateSchema>;
