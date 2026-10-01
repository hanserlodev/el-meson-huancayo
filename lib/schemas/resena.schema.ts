import { z } from "zod";

export const resenaSchema = z.object({
  platoId: z.string().trim().min(1, "Selecciona un plato").max(80, "Plato inválido"),
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(60, "Nombre muy largo"),
  rating: z
    .number()
    .int("Rating 1 a 5 (entero)")
    .min(1, "Rating 1 a 5 (entero)")
    .max(5, "Rating 1 a 5 (entero)"),
  comentario: z.string().trim().min(5, "Comentario muy corto").max(500, "Comentario máx 500 caracteres"),
});

export type ResenaInput = z.infer<typeof resenaSchema>;
