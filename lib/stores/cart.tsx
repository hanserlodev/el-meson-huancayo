"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WHATSAPP } from "@/lib/data";

export interface CartItem {
  nombre: string;
  precio: number;
  cant: number;
}

/** Datos del checkout (no viven en el carrito) para armar el mensaje de WhatsApp. */
export interface WhatsAppCheckout {
  subtotal: number;
  deliveryFee: number;
  total: number;
  modo: "delivery" | "pickup";
  cliente?: { nombre?: string; tel?: string; direccion?: string };
  pago?: string;
  notas?: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  unidades: number;
  soles: (n: number) => string;
  agregar: (nombre: string, precio: number) => void;
  cambiar: (pos: number, delta: number) => void;
  eliminar: (pos: number) => void;
  vaciar: () => void;
  pedirPorWhatsApp: (checkout?: WhatsAppCheckout) => void;
}

const CartContext = createContext<CartContextType | null>(null);
const KEY = "carrito-meson";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState<string | null>(null);

  // sincroniza si otra pestaña modifica localStorage
  useEffect(() => {
    const sync = () => { try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw) as CartItem[]); } catch {} };
    const onStorage = (e: StorageEvent) => { if (e.key === KEY && e.newValue) { try { setItems(JSON.parse(e.newValue) as CartItem[]); } catch {} } };
    const onFocus = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onFocus); };
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { console.error("[cart] persist quota", e); }
  }, []);

  const soles = (n: number) => Number.isFinite(n) ? n.toFixed(2) : "0.00";
  const total = items.reduce((a, i) => a + i.precio * i.cant, 0);
  const unidades = items.reduce((a, i) => a + i.cant, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const agregar = (nombre: string, precio: number) => {
    const p = Number(precio);
    if (!nombre.trim() || !Number.isFinite(p) || p <= 0) { showToast("Precio inválido"); return; }
    const idx = items.findIndex((i) => i.nombre === nombre);
    let next: CartItem[];
    if (idx >= 0) {
      next = items.map((it, i) => (i === idx ? { ...it, cant: it.cant + 1 } : it));
    } else {
      next = [...items, { nombre: nombre.trim().slice(0,120), precio: p, cant: 1 }];
    }
    persist(next);
    showToast(`${nombre} agregado al carrito`);
  };

  const cambiar = (pos: number, delta: number) => {
    if (!items[pos]) return;
    const next = items.map((it, i) => i === pos ? { ...it, cant: it.cant + delta } : it).filter(it => it.cant > 0);
    persist(next);
  };

  const eliminar = (pos: number) => {
    const q = items[pos];
    const next = [...items];
    next.splice(pos, 1);
    persist(next);
    if (q) showToast(`${q.nombre} eliminado`);
  };

  const vaciar = () => {
    if (!items.length) return showToast("El carrito ya está vacío");
    persist([]);
    showToast("Carrito vaciado");
  };

  const pedirPorWhatsApp = (checkout?: WhatsAppCheckout) => {
    if (!items.length) return showToast("El carrito está vacío");
    const lineas = items.map((i) => `• ${i.cant}x ${i.nombre} — S/ ${soles(i.precio * i.cant)}`);
    let msg: string;
    if (checkout) {
      const { subtotal, deliveryFee, total: totalPagar, modo, cliente, pago, notas } = checkout;
      const entrega = modo === "delivery"
        ? `Dirección: ${cliente?.direccion || "—"}`
        : "Modalidad: Recojo en Av. Giráldez 157";
      msg = [
        "🍗 *PEDIDO EL MESÓN*",
        ...lineas,
        `Subtotal: S/ ${soles(subtotal)}`,
        `Delivery: ${deliveryFee === 0 ? "GRATIS" : `S/ ${soles(deliveryFee)}`}`,
        `TOTAL: S/ ${soles(totalPagar)}`,
        `Cliente: ${cliente?.nombre || "—"}`,
        `Tel: ${cliente?.tel || "—"}`,
        entrega,
        `Pago: ${pago || "—"}`,
        ...(notas ? [`Notas: ${notas}`] : []),
      ].join("\n");
    } else {
      msg = `Hola El Mesón, quiero pedir:\n${lineas.join("\n")}\nTotal: S/ ${soles(total)}`;
    }
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <CartContext.Provider value={{ items, total, unidades, soles, agregar, cambiar, eliminar, vaciar, pedirPorWhatsApp }}>
      {children}
      {/* Toast global */}
      <div
        id="toast"
        role="status"
        aria-live="polite"
        className={`bg-ink text-white px-5 py-3 rounded-full shadow-pop font-semibold text-sm ${toast ? "show" : ""}`}
        style={{ display: toast ? "block" : undefined }}
      >
        {toast}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
