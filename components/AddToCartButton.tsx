"use client";

import { useCart } from "@/lib/stores/cart";

interface Props {
  nombre: string;
  precio: number;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Botón reutilizable para agregar platos al carrito.
 * Centraliza estilos y lógica de `agregar` para evitar duplicación en /carta y /.
 */
export default function AddToCartButton({ nombre, precio, compact = false, className = "", children }: Props) {
  const { agregar } = useCart();
  return (
    <button
      onClick={() => agregar(nombre, precio)}
      aria-label={`Agregar ${nombre} al carrito`}
      className={`bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-95 transition ${compact ? "text-sm py-2 px-3 rounded-lg" : "py-2.5 rounded-xl"} ${className}`}
    >
      {children ?? (compact ? "Agregar +" : "Agregar al carrito +")}
    </button>
  );
}
