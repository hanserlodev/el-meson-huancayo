"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/stores/cart";
import { MAPS_URL } from "@/lib/data";

const links = [
  { href: "/", label: "Inicio", id: "inicio" },
  { href: "/carta", label: "Carta", id: "carta" },
  { href: "/carrito", label: "Carrito", id: "carrito" },
  { href: "/reserva", label: "Reserva", id: "reserva" },
];

export default function Header() {
  const pathname = usePathname();
  const { unidades } = useCart();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div id="site-header">
      <div className="bg-ink text-slate-200 text-xs text-center px-4 py-2">
        Martes de brasa: 1/4 de pollo a S/ 13.90 · Delivery: 939 399 946 · Lun–Dom 11:00–23:00
      </div>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/imagenes/logo.jpg"
              alt="Logo Pollos y Parrillas El Mesón"
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-900/10 shadow-card"
            />
            <span className="leading-tight">
              <span className="block font-display font-bold text-ink">El Mesón</span>
              <span className="block text-[11px] text-slate-500 tracking-wide">POLLOS Y PARRILLAS · DESDE 1985</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="nav-link text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/carrito"
              className="inline-flex items-center gap-2 bg-ink text-white pl-4 pr-3 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors"
              aria-label="Ver carrito"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span
                data-cart-count
                className="grid place-items-center min-w-[1.5rem] h-6 px-1 rounded-full bg-amber-400 text-ink text-xs font-bold"
              >
                {unidades}
              </span>
            </Link>
            <Link
              href="/reserva"
              className="hidden sm:inline-flex bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-700 shadow-card transition-colors"
            >
              Reservar
            </Link>
            <button
              id="menu-btn"
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 grid place-items-center rounded-lg ring-1 ring-slate-200 text-xl"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              ☰
            </button>
          </div>
        </div>

        <div
          id="menu-movil"
          className={`${open ? "flex" : "hidden"} md:hidden border-t border-slate-100 px-4 py-3 gap-5 bg-white`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="nav-link text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      {/* preload maps url for SEO parity with legacy layout.js:65 */}
      <link rel="prefetch" href={MAPS_URL} />
    </div>
  );
}
