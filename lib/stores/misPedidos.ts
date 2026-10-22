import { CODIGO_PEDIDO_RE } from "@/lib/schemas/pedido.schema";
import { normalizarCodigo } from "@/lib/services/pedidos.service";

/**
 * Códigos de pedido guardados en ESTE navegador (sin cuentas de cliente).
 * Solo guardamos el código y la fecha en que se añadió: ni nombres ni montos.
 */
const KEY = "meson_mis_pedidos_v1";
const MAX = 20;
const EMPTY: PedidoGuardado[] = [];

export interface PedidoGuardado {
  codigo: string;
  fecha: string;
}

let cache: PedidoGuardado[] | null = null;
const listeners = new Set<() => void>();

function disponible(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitir(): void {
  listeners.forEach((l) => l());
}

export function leerCodigos(): PedidoGuardado[] {
  if (!disponible()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p): p is PedidoGuardado =>
          !!p &&
          typeof p === "object" &&
          typeof (p as PedidoGuardado).codigo === "string" &&
          CODIGO_PEDIDO_RE.test((p as PedidoGuardado).codigo)
      )
      .map((p) => ({ codigo: p.codigo, fecha: typeof p.fecha === "string" ? p.fecha : "" }))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/** Suscripción para `useSyncExternalStore` (incluye cambios desde otras pestañas). */
export function suscribirMisPedidos(cb: () => void): () => void {
  listeners.add(cb);

  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Snapshot estable (misma referencia si no hubo cambios). */
export function misPedidosSnapshot(): PedidoGuardado[] {
  if (cache === null) cache = leerCodigos();
  return cache;
}

/** Snapshot del servidor: la lista solo existe en el navegador. */
export function misPedidosServerSnapshot(): PedidoGuardado[] {
  return EMPTY;
}

export function guardarCodigo(codigo: string): void {
  if (!disponible()) return;
  const normalizado = normalizarCodigo(codigo);
  if (!CODIGO_PEDIDO_RE.test(normalizado)) return;

  const siguientes = [
    { codigo: normalizado, fecha: new Date().toISOString() },
    ...leerCodigos().filter((p) => p.codigo !== normalizado),
  ].slice(0, MAX);

  try {
    window.localStorage.setItem(KEY, JSON.stringify(siguientes));
    cache = siguientes;
    emitir();
  } catch (err) {
    console.error("[misPedidos] no se pudo guardar el código", err);
  }
}

export function quitarCodigo(codigo: string): void {
  if (!disponible()) return;
  const normalizado = normalizarCodigo(codigo);
  const siguientes = leerCodigos().filter((p) => p.codigo !== normalizado);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(siguientes));
    cache = siguientes;
    emitir();
  } catch (err) {
    console.error("[misPedidos] no se pudo quitar el código", err);
  }
}
