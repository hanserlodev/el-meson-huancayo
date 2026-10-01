import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/repositories/reservas.repo", () => ({
  reservasRepo: {
    list: vi.fn(),
    listen: vi.fn(),
    listAforoByFecha: vi.fn(),
    createWithAforo: vi.fn(),
    updateEstado: vi.fn(),
    remove: vi.fn(),
  },
}));

import { crearReserva } from "@/lib/services/reservas.service";
import { reservasRepo } from "@/lib/repositories/reservas.repo";

const mocked = vi.mocked(reservasRepo);

function fechaFutura(dias = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const base = () => ({
  nombre: "Ana Pérez",
  tel: "939 123 456",
  personas: 4,
  fecha: fechaFutura(),
  hora: "20:00",
});

beforeEach(() => {
  vi.clearAllMocks();
  mocked.createWithAforo.mockResolvedValue("res-1");
  mocked.listAforoByFecha.mockResolvedValue([]);
});

afterEach(() => vi.restoreAllMocks());

describe("crearReserva", () => {
  it("rechaza nombre demasiado corto", async () => {
    await expect(crearReserva({ ...base(), nombre: "A" })).rejects.toThrow("Ingresa tu nombre");
    expect(mocked.createWithAforo).not.toHaveBeenCalled();
  });

  it("rechaza fecha pasada", async () => {
    await expect(crearReserva({ ...base(), fecha: "2020-01-01" })).rejects.toThrow("La fecha no puede ser pasada");
    expect(mocked.createWithAforo).not.toHaveBeenCalled();
  });

  it("rechaza hora fuera de atención", async () => {
    await expect(crearReserva({ ...base(), hora: "23:30" })).rejects.toThrow("Atendemos de 11:00 a 23:00");
  });

  it("rechaza personas fuera de rango", async () => {
    await expect(crearReserva({ ...base(), personas: 21 })).rejects.toThrow("1 a 20 personas");
  });

  it("rechaza si no hay aforo disponible en la sede", async () => {
    mocked.listAforoByFecha.mockResolvedValue([
      { id: "a1", fecha: base().fecha, sede: "Giráldez", personas: 58, estado: "confirmada", reservaId: "r1" },
    ]);
    await expect(crearReserva({ ...base(), personas: 5 })).rejects.toThrow("Sin aforo disponible");
    expect(mocked.createWithAforo).not.toHaveBeenCalled();
  });

  it("ignora reservas canceladas al calcular aforo", async () => {
    mocked.listAforoByFecha.mockResolvedValue([
      { id: "a1", fecha: base().fecha, sede: "Giráldez", personas: 58, estado: "cancelada", reservaId: "r1" },
    ]);
    await expect(crearReserva({ ...base(), personas: 5 })).resolves.toBe("res-1");
  });

  it("crea la reserva y persiste estado confirmada", async () => {
    await expect(crearReserva(base())).resolves.toBe("res-1");
    expect(mocked.createWithAforo).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Ana Pérez", personas: 4, sede: "Giráldez", estado: "confirmada" })
    );
  });

  it("es best-effort: si falla la lectura de aforo, igual crea la reserva", async () => {
    mocked.listAforoByFecha.mockRejectedValue(new Error("permission-denied"));
    await expect(crearReserva(base())).resolves.toBe("res-1");
    expect(mocked.createWithAforo).toHaveBeenCalled();
  });
});
