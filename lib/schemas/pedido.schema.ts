import { z } from "zod";

/** Código público de seguimiento: MES- + 6 caracteres sin ambigüedades. */
export const CODIGO_PEDIDO_RE = /^MES-[A-HJ-NP-Z2-9]{6}$/;

export const cartItemSchema = z.object({
  nombre: z.string().trim().min(1, "Item inválido").max(120, "Item inválido"),
  precio: z.number().finite("Precio inválido").positive("Precio inválido"),
  cant: z.number().int("Cantidad inválida").min(1, "Cantidad inválida").max(50, "Cantidad inválida"),
});

export const pedidoSchema = z.object({
  items: z.array(cartItemSchema).min(1, "El carrito está vacío").max(50, "Demasiados ítems"),
  total: z.number().finite("Total inválido").positive("Total inválido").max(5000, "Total excede límite"),
  modo: z.enum(["delivery", "pickup"]).optional(),
  subtotal: z.number().finite("Subtotal inválido").nonnegative("Subtotal inválido").max(5000).optional(),
  delivery: z.number().finite("Delivery inválido").nonnegative("Delivery inválido").max(100).optional(),
  pago: z.string().trim().max(40, "Método de pago inválido").optional(),
  notas: z.string().trim().max(300, "Notas muy largas").optional(),
  cliente: z
    .object({
      nombre: z.string().trim().max(80, "Nombre muy largo").optional(),
      tel: z.string().trim().max(20, "Teléfono muy largo").optional(),
      direccion: z.string().trim().max(200, "Dirección muy larga").optional(),
    })
    .nullish(),
});

export type PedidoSchemaInput = z.infer<typeof pedidoSchema>;
