"use client";

import { useCart } from "@/lib/stores/cart";

export default function AddToCartButton({ nombre, precio, compact = false }: { nombre: string; precio: number; compact?: boolean }) {
  const { agregar } = useCart();
  return (
    <button
      onClick={() => agregar(nombre, precio)}
      className={`mt-4 w-full bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 active:scale-95 transition ${compact ? "text-sm" : ""}`}
    >
      {compact ? "Agregar +" : "Agregar al carrito +"}
    </button>
  );
}
