import { z } from "zod";

export const categoriaPlatoSchema = z.enum(["brasa", "parrilla", "extra"]);

export const platoCreateSchema = z.object({
  id: z.string().min(1).optional(),
  nombre: z.string().trim().min(2, "Nombre requerido").max(120, "Nombre muy largo"),
  precio: z.number().finite("Precio 0-1000").positive("Precio 0-1000").max(1000, "Precio 0-1000"),
  cat: categoriaPlatoSchema,
  desc: z.string().trim().max(500, "Descripción muy larga").default(""),
  img: z.string().default(""),
  tag: z.string().default(""),
  rating: z.string().default(""),
  votos: z.number().int().min(0).default(0),
  activo: z.boolean().optional(),
});

export const platoUpdateSchema = platoCreateSchema.partial();

export type PlatoCreateInput = z.infer<typeof platoCreateSchema>;
export type PlatoUpdateInput = z.infer<typeof platoUpdateSchema>;
