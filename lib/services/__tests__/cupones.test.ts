import { describe, expect, it } from "vitest";
import { calcularDescuento, cuponVigente } from "@/lib/schemas/cupon.schema";

const base = { tipo: "porcentaje" as const, valor: 10, minimo: 0, activo: true };

describe("calcularDescuento", () => {
  it("aplica porcentaje sobre el subtotal", () => {
    expect(calcularDescuento(base, 100)).toBe(10);
  });

  it("aplica monto fijo sin pasar del subtotal", () => {
    expect(calcularDescuento({ ...base, tipo: "monto", valor: 15 }, 100)).toBe(15);
    expect(calcularDescuento({ ...base, tipo: "monto", valor: 150 }, 100)).toBe(100);
  });

  it("redondea a dos decimales", () => {
    expect(calcularDescuento({ ...base, valor: 33.33 }, 19.9)).toBe(6.63);
  });

  it("no aplica si está inactivo, vencido o no llega al mínimo", () => {
    expect(calcularDescuento({ ...base, activo: false }, 100)).toBe(0);
    expect(calcularDescuento({ ...base, expira: "2020-01-01" }, 100)).toBe(0);
    expect(calcularDescuento({ ...base, minimo: 200 }, 100)).toBe(0);
  });

  it("no aplica sobre subtotales inválidos", () => {
    expect(calcularDescuento(base, 0)).toBe(0);
    expect(calcularDescuento(base, -5)).toBe(0);
  });
});

describe("cuponVigente", () => {
  it("sin fecha siempre vigente", () => {
    expect(cuponVigente(undefined)).toBe(true);
  });

  it("compara contra el fin del día", () => {
    const hoy = new Date("2026-05-10T12:00:00");
    expect(cuponVigente("2026-05-10", hoy)).toBe(true);
    expect(cuponVigente("2026-05-09", hoy)).toBe(false);
  });
});
