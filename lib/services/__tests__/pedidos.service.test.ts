import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/repositories/pedidos.repo", () => ({
  pedidosRepo: {
    list: vi.fn(),
    listen: vi.fn(),
    create: vi.fn(),
    updateEstado: vi.fn(),
    remove: vi.fn(),
  },
}));

import { crearPedido } from "@/lib/services/pedidos.service";
import { pedidosRepo } from "@/lib/repositories/pedidos.repo";

const mocked = vi.mocked(pedidosRepo);

const item = (over: Partial<{ nombre: string; precio: number; cant: number }> = {}) => ({
  nombre: "1/4 Pollo",
  precio: 20,
  cant: 1,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocked.create.mockResolvedValue("ped-1");
});

afterEach(() => vi.restoreAllMocks());

describe("crearPedido", () => {
  it("rechaza carrito vacío", async () => {
    await expect(crearPedido([], 20)).rejects.toThrow("El carrito está vacío");
    expect(mocked.create).not.toHaveBeenCalled();
  });

  it("rechaza total inválido", async () => {
    await expect(crearPedido([item()], 0)).rejects.toThrow("Total inválido");
  });

  it("rechaza total por encima del límite", async () => {
    await expect(crearPedido([item({ precio: 100, cant: 50 })], 5001)).rejects.toThrow("Total excede límite");
  });

  it("rechaza item con precio inválido", async () => {
    await expect(crearPedido([item({ precio: -1 })], 20)).rejects.toThrow("Precio inválido");
  });

  it("rechaza manipulación cuando el total es menor al subtotal", async () => {
    await expect(crearPedido([item({ precio: 100, cant: 2 })], 50)).rejects.toThrow("posible manipulación");
    expect(mocked.create).not.toHaveBeenCalled();
  });

  it("acepta un total con delivery dentro de la tolerancia", async () => {
    // subtotal 20 + delivery 5 = 25
    await expect(crearPedido([item({ precio: 20, cant: 1 })], 25)).resolves.toBe("ped-1");
    expect(mocked.create).toHaveBeenCalledWith(
      expect.objectContaining({ total: 25, estado: "pendiente" })
    );
  });

  it("sanea los datos del cliente y crea el pedido", async () => {
    await expect(
      crearPedido([item({ precio: 20, cant: 2 })], 40, { nombre: "  Luis  ", tel: " 999 999 999 " })
    ).resolves.toBe("ped-1");
    expect(mocked.create).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 40,
        cliente: { nombre: "Luis", tel: "999 999 999", direccion: "" },
      })
    );
  });
});
