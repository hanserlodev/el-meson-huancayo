import { z } from "zod";

export const tipoOfertaSchema = z.enum(["martes", "combo", "delivery", "descuento"]);

export const ofertaCreateSchema = z.object({
  titulo: z.string().trim().min(3, "Título requerido (≥3)").max(120, "Título muy largo"),
  descripcion: z.string().trim().max(300, "Descripción muy larga").default(""),
  tipo: tipoOfertaSchema,
  platoId: z.string().optional(),
  descuento: z.number().min(0, "Descuento 0-100").max(100, "Descuento 0-100").optional(),
  precioOferta: z
    .number()
    .finite("Precio oferta inválido")
    .positive("Precio oferta inválido")
    .max(1000, "Precio oferta inválido")
    .optional(),
  fechaIni: z.string().optional(),
  fechaFin: z.string().optional(),
  activo: z.boolean(),
});

export const ofertaUpdateSchema = ofertaCreateSchema.partial();

export type OfertaInput = z.infer<typeof ofertaCreateSchema>;
export type OfertaUpdateInput = z.infer<typeof ofertaUpdateSchema>;
