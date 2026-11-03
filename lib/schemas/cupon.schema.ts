import { z } from "zod";

export const cuponSchema = z.object({
  codigo: z.string().trim().toUpperCase().min(3, "Código muy corto").max(24, "Código muy largo"),
  tipo: z.enum(["porcentaje", "monto"]),
  valor: z.number().finite("Valor inválido").positive("Valor inválido").max(500, "Valor muy alto"),
  minimo: z.number().finite("Mínimo inválido").nonnegative("Mínimo inválido").max(5000).default(0),
  activo: z.boolean().default(true),
  /** Fecha límite en formato YYYY-MM-DD (opcional). */
  expira: z.string().trim().max(10).optional(),
});

export type CuponInput = z.infer<typeof cuponSchema>;
export type CuponTipo = CuponInput["tipo"];

/** true si el cupón no tiene fecha o si aún no vence. */
export function cuponVigente(expira?: string, hoy: Date = new Date()): boolean {
  if (!expira) return true;
  const fin = new Date(`${expira}T23:59:59`);
  if (Number.isNaN(fin.getTime())) return true;
  return hoy.getTime() <= fin.getTime();
}

/** Calcula el descuento aplicable a un subtotal (nunca mayor que el subtotal). */
export function calcularDescuento(
  cupon: Pick<CuponInput, "tipo" | "valor" | "minimo" | "activo" | "expira">,
  subtotal: number
): number {
  if (!cupon.activo || !Number.isFinite(subtotal) || subtotal <= 0) return 0;
  if (subtotal < (cupon.minimo ?? 0)) return 0;
  if (!cuponVigente(cupon.expira)) return 0;

  const bruto = cupon.tipo === "porcentaje" ? subtotal * (cupon.valor / 100) : cupon.valor;
  return Math.min(subtotal, Math.round(bruto * 100) / 100);
}
