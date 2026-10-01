import { z } from "zod";

export const cartItemSchema = z.object({
  nombre: z.string().trim().min(1, "Item inválido").max(120, "Item inválido"),
  precio: z.number().finite("Precio inválido").positive("Precio inválido"),
  cant: z.number().int("Cantidad inválida").min(1, "Cantidad inválida").max(50, "Cantidad inválida"),
});

export const pedidoSchema = z.object({
  items: z.array(cartItemSchema).min(1, "El carrito está vacío"),
  total: z.number().finite("Total inválido").positive("Total inválido").max(5000, "Total excede límite"),
  cliente: z
    .object({
      nombre: z.string().trim().max(80, "Nombre muy largo").optional(),
      tel: z.string().trim().max(20, "Teléfono muy largo").optional(),
      direccion: z.string().trim().max(200, "Dirección muy larga").optional(),
    })
    .nullish(),
});

export type PedidoSchemaInput = z.infer<typeof pedidoSchema>;
