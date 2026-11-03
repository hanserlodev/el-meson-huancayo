import { z } from "zod";

export const direccionSchema = z.object({
  id: z.string().min(1),
  alias: z.string().trim().max(40).default("Casa"),
  direccion: z.string().trim().min(3, "Dirección muy corta").max(200, "Dirección muy larga"),
  referencia: z.string().trim().max(120).optional(),
  principal: z.boolean().optional(),
});

export const usuarioSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(80, "Nombre muy largo"),
  email: z.string().trim().email("Correo inválido").max(120),
  telefono: z.string().trim().max(20, "Teléfono muy largo").default(""),
  direcciones: z.array(direccionSchema).max(5, "Máximo 5 direcciones").default([]),
  rol: z.enum(["cliente", "admin"]).default("cliente"),
});

export const perfilUpdateSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(80, "Nombre muy largo").optional(),
  telefono: z.string().trim().max(20, "Teléfono muy largo").optional(),
  direcciones: z.array(direccionSchema).max(5, "Máximo 5 direcciones").optional(),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type PerfilUpdateInput = z.infer<typeof perfilUpdateSchema>;
export type Direccion = z.infer<typeof direccionSchema>;
