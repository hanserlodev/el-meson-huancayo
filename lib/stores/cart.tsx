"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WHATSAPP } from "@/lib/data";

export interface CartItem {
  nombre: string;
  precio: number;
  cant: number;
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
  finalizar: () => void;
  pedirPorWhatsApp: () => void;
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
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const soles = (n: number) => n.toFixed(2);
  const total = items.reduce((a, i) => a + i.precio * i.cant, 0);
  const unidades = items.reduce((a, i) => a + i.cant, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
    // compat con window.Toast legacy si existe
    if (typeof window !== "undefined" && (window as unknown as { Toast?: (m: string) => void }).Toast) {
      (window as unknown as { Toast: (m: string) => void }).Toast(msg);
    }
  };

  const agregar = (nombre: string, precio: number) => {
    const p = Number(precio);
    const idx = items.findIndex((i) => i.nombre === nombre);
    let next: CartItem[];
    if (idx >= 0) {
      next = items.map((it, i) => (i === idx ? { ...it, cant: it.cant + 1 } : it));
    } else {
      next = [...items, { nombre, precio: p, cant: 1 }];
    }
    persist(next);
    showToast(`${nombre} agregado al carrito`);
  };

  const cambiar = (pos: number, delta: number) => {
    if (!items[pos]) return;
    const next = [...items];
    next[pos].cant += delta;
    if (next[pos].cant <= 0) next.splice(pos, 1);
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

  const finalizar = () => {
    if (!items.length) return showToast("El carrito está vacío");
    const t = soles(total);
    showToast(`Pedido registrado: ${unidades} plato(s) por S/ ${t}`);
    // se deja alert como legacy para compatibilidad UX anterior
    alert(`¡Pedido realizado en Pollos y Parrillas El Mesón!\n${unidades} plato(s) · Total: S/ ${t}`);
    persist([]);
  };

  const pedirPorWhatsApp = () => {
    if (!items.length) return showToast("El carrito está vacío");
    const lineas = items.map((i) => `• ${i.cant}x ${i.nombre} — S/ ${soles(i.precio * i.cant)}`);
    const msg = `Hola El Mesón, quiero pedir:\n${lineas.join("\n")}\nTotal: S/ ${soles(total)}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <CartContext.Provider value={{ items, total, unidades, soles, agregar, cambiar, eliminar, vaciar, finalizar, pedirPorWhatsApp }}>
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
