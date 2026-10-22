import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/repositories/pedidos.repo", () => ({
  pedidosRepo: {
    list: vi.fn(),
    listen: vi.fn(),
    create: vi.fn(),
    createWithSeguimiento: vi.fn(),
    getSeguimiento: vi.fn(),
    listenSeguimiento: vi.fn(),
    updateEstadoConSeguimiento: vi.fn(),
    removeWithSeguimiento: vi.fn(),
    updateEstado: vi.fn(),
    remove: vi.fn(),
  },
}));

import {
  crearPedido,
  normalizarCodigo,
  nuevoCodigoPedido,
  updateEstadoPedido,
} from "@/lib/services/pedidos.service";
import { CODIGO_PEDIDO_RE } from "@/lib/schemas/pedido.schema";
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
  mocked.createWithSeguimiento.mockResolvedValue("ped-1");
  mocked.create.mockResolvedValue("ped-1");
  mocked.getSeguimiento.mockResolvedValue(null);
});

afterEach(() => vi.restoreAllMocks());

describe("nuevoCodigoPedido", () => {
  it("genera códigos con el formato esperado y sin repetir", () => {
    const codigos = new Set(Array.from({ length: 200 }, () => nuevoCodigoPedido()));
    expect(codigos.size).toBe(200);
    for (const codigo of codigos) expect(codigo).toMatch(CODIGO_PEDIDO_RE);
  });
});

describe("normalizarCodigo", () => {
  it("acepta el código con o sin prefijo y en minúsculas", () => {
    expect(normalizarCodigo("7k3p9a")).toBe("MES-7K3P9A");
    expect(normalizarCodigo("MES7K3P9A")).toBe("MES-7K3P9A");
    expect(normalizarCodigo(" mes-7k3p9a ")).toBe("MES-7K3P9A");
    expect(normalizarCodigo("")).toBe("");
  });
});

describe("crearPedido", () => {
  it("rechaza carrito vacío", async () => {
    await expect(crearPedido([], 20)).rejects.toThrow("El carrito está vacío");
    expect(mocked.createWithSeguimiento).not.toHaveBeenCalled();
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
    expect(mocked.createWithSeguimiento).not.toHaveBeenCalled();
  });

  it("crea pedido + seguimiento y devuelve id y código", async () => {
    const res = await crearPedido([item({ precio: 20, cant: 1 })], 25);

    expect(res.id).toBe("ped-1");
    expect(res.codigo).toMatch(CODIGO_PEDIDO_RE);
    expect(mocked.createWithSeguimiento).toHaveBeenCalledWith(
      expect.objectContaining({ total: 25, estado: "pendiente" }),
      res.codigo
    );
  });

  it("sanea los datos del cliente y guarda extras del checkout", async () => {
    await crearPedido(
      [item({ precio: 20, cant: 2 })],
      40,
      { nombre: "  Luis  ", tel: " 999 999 999 " },
      { modo: "pickup", subtotal: 40, delivery: 0, pago: "Efectivo", notas: "sin ají" }
    );

    expect(mocked.createWithSeguimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 40,
        modo: "pickup",
        subtotal: 40,
        delivery: 0,
        pago: "Efectivo",
        notas: "sin ají",
        cliente: { nombre: "Luis", tel: "999 999 999", direccion: "" },
      }),
      expect.stringMatching(CODIGO_PEDIDO_RE)
    );
  });

  it("no rompe el checkout si el espejo no está disponible", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mocked.createWithSeguimiento.mockRejectedValueOnce(new Error("permission-denied"));

    const res = await crearPedido([item({ precio: 20, cant: 1 })], 20);

    expect(res.id).toBe("ped-1");
    expect(res.codigo).toMatch(CODIGO_PEDIDO_RE);
    expect(mocked.create).toHaveBeenCalledWith(expect.objectContaining({ codigo: res.codigo }));
  });
});

describe("updateEstadoPedido", () => {
  it("sincroniza el pedido con su seguimiento público", async () => {
    await updateEstadoPedido("ped-1", "enHorno", "MES-ABC234");
    expect(mocked.updateEstadoConSeguimiento).toHaveBeenCalledWith("ped-1", "enHorno", "MES-ABC234");
  });
});
