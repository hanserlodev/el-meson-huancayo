import { z } from "zod";

export const SEDES = ["Giráldez", "Real"] as const;

export const reservaSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(80, "Nombre muy largo"),
  tel: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[\d\s+()-]{7,20}$/.test(v), "Teléfono inválido")
    .optional(),
  personas: z
    .number()
    .int("1 a 20 personas")
    .min(1, "1 a 20 personas")
    .max(20, "1 a 20 personas"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  hora: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora inválida")
    .refine((h) => h >= "11:00" && h <= "23:00", "Atendemos de 11:00 a 23:00"),
  sede: z.enum(SEDES).default("Giráldez"),
  zona: z.string().trim().max(60, "Zona muy larga").optional(),
});

export type ReservaSchemaInput = z.infer<typeof reservaSchema>;
