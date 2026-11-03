import {
  pedidosRepo,
  type EstadoPedido,
  type ModoEntrega,
  type PedidoRow,
  type PedidoWithId,
  type SeguimientoWithId,
} from "@/lib/repositories/pedidos.repo";
import type { CartItem } from "@/lib/stores/cart";
import { auth } from "@/lib/firebase/client";
import { parseOrThrow } from "@/lib/schemas/parse";
import { CODIGO_PEDIDO_RE, pedidoSchema } from "@/lib/schemas/pedido.schema";

export type { EstadoPedido, ModoEntrega };
export type PedidoDoc = PedidoRow & { id: string; createdAt?: unknown };
export type SeguimientoDoc = SeguimientoWithId;

export interface CrearPedidoResult {
  id: string;
  codigo: string;
}

export interface PedidoExtras {
  modo?: ModoEntrega;
  subtotal?: number;
  delivery?: number;
  pago?: string;
  notas?: string;
  cupon?: string;
  descuento?: number;
}

/** Alfabeto sin caracteres ambiguos (0/O, 1/I/L). */
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Genera un código público de seguimiento tipo `MES-7K3P9A`. */
export function nuevoCodigoPedido(): string {
  const bytes = new Uint8Array(6);
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let sufijo = "";
  for (const b of bytes) sufijo += ALFABETO[b % ALFABETO.length];
  return `MES-${sufijo}`;
}

/** Acepta `7k3p9a`, `MES7K3P9A` o `MES-7K3P9A` y devuelve el formato canónico. */
export function normalizarCodigo(codigo: string): string {
  const limpio = codigo.trim().toUpperCase().replace(/\s+/g, "");
  if (!limpio) return "";
  return `MES-${limpio.replace(/^MES-?/, "")}`;
}

async function codigoOcupado(codigo: string): Promise<boolean> {
  try {
    return Boolean(await pedidosRepo.getSeguimiento(codigo));
  } catch {
    // Si no se puede comprobar, intentamos crear igual (las reglas evitan sobrescribir).
    return false;
  }
}

function toDoc(p: PedidoWithId): PedidoDoc {
  return { ...p };
}

export async function crearPedido(
  items: CartItem[],
  total: number,
  cliente?: PedidoRow["cliente"],
  extras: PedidoExtras = {}
): Promise<CrearPedidoResult> {
  const data = parseOrThrow(pedidoSchema, {
    items,
    total,
    cliente,
    uid: auth.currentUser?.uid,
    ...extras,
  });

  // NOTA: esto corre en el navegador; es un soft-check disuasorio, NO una
  // validación server-side. Un cliente manipulado puede enviar otro `total`.
  // Mejora futura: Cloud Function que recalcule el total desde `platos`.
  const subtotalCalc = data.items.reduce((a, i) => a + i.precio * i.cant, 0);
  const descuento = data.descuento ?? 0;
  const delivery = data.delivery ?? 0;
  if (descuento > subtotalCalc) throw new Error("Descuento inválido");
  const esperado = subtotalCalc - descuento + delivery;
  if (data.total < esperado - 1) {
    throw new Error("Total no coincide con items (posible manipulación)");
  }

  let codigo = nuevoCodigoPedido();
  for (let intento = 0; intento < 3 && (await codigoOcupado(codigo)); intento++) {
    codigo = nuevoCodigoPedido();
  }

  const row: PedidoRow = {
    items: data.items,
    total: data.total,
    subtotal: data.subtotal,
    delivery: data.delivery,
    modo: data.modo,
    pago: data.pago,
    notas: data.notas,
    cliente: data.cliente
      ? {
          nombre: data.cliente.nombre ?? "",
          tel: data.cliente.tel ?? "",
          direccion: data.cliente.direccion ?? "",
        }
      : null,
    estado: "pendiente",
  };

  // Solo se escriben si existen (evita campos undefined en Firestore).
  if (data.uid) row.uid = data.uid;
  if (data.cupon) row.cupon = data.cupon;
  if (descuento > 0) row.descuento = descuento;
  try {
    const id = await pedidosRepo.createWithSeguimiento(row, codigo);
    return { id, codigo };
  } catch (err) {
    // Si el espejo público no está disponible (p. ej. reglas sin desplegar),
    // no rompemos el checkout: guardamos el pedido y seguimos.
    console.warn("[pedidos] seguimiento no disponible, se guarda solo el pedido:", err);
    const id = await pedidosRepo.create({ ...row, codigo });
    return { id, codigo };
  }
}

export function subscribePedidos(cb: (data: PedidoDoc[]) => void) {
  return pedidosRepo.listen(
    (rows) => cb(rows.map(toDoc)),
    () => cb([])
  );
}

function fechaMs(valor: unknown): number {
  if (!valor) return 0;
  if (typeof valor === "string") return Date.parse(valor) || 0;
  if (typeof valor === "object" && valor !== null && "toMillis" in valor) {
    return (valor as { toMillis: () => number }).toMillis();
  }
  return 0;
}

/** Pedidos de la cuenta, del más reciente al más antiguo. */
export function subscribePedidosUsuario(
  uid: string,
  cb: (data: PedidoDoc[]) => void,
  onError?: (e: unknown) => void
) {
  return pedidosRepo.listenByUid(
    uid,
    (rows) => cb(rows.map(toDoc).sort((a, b) => fechaMs(b.createdAt) - fechaMs(a.createdAt))),
    onError ?? (() => cb([]))
  );
}

export async function getPedidos(): Promise<PedidoDoc[]> {
  const rows = await pedidosRepo.list();
  return rows.map(toDoc);
}

/** Busca el seguimiento público de un pedido. Devuelve `null` si no existe o el código es inválido. */
export async function buscarPedido(codigo: string): Promise<SeguimientoDoc | null> {
  const normalizado = normalizarCodigo(codigo);
  if (!CODIGO_PEDIDO_RE.test(normalizado)) return null;
  return pedidosRepo.getSeguimiento(normalizado);
}

/** Suscripción en vivo al estado de un pedido (por código público). */
export function subscribePedido(
  codigo: string,
  cb: (data: SeguimientoDoc | null) => void,
  onError?: (e: unknown) => void
): () => void {
  const normalizado = normalizarCodigo(codigo);
  if (!CODIGO_PEDIDO_RE.test(normalizado)) {
    cb(null);
    return () => {};
  }
  return pedidosRepo.listenSeguimiento(normalizado, cb, onError);
}

export async function updateEstadoPedido(id: string, estado: EstadoPedido, codigo?: string) {
  return pedidosRepo.updateEstadoConSeguimiento(id, estado, codigo);
}

export async function deletePedido(id: string, codigo?: string) {
  return pedidosRepo.removeWithSeguimiento(id, codigo);
}
