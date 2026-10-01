import type { ZodType } from "zod";

/**
 * Valida con Zod y lanza el primer mensaje de error como `Error`.
 * Centraliza el manejo para que los servicios no repitan `safeParse`.
 */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first?.message ?? "Datos inválidos");
  }
  return result.data;
}
