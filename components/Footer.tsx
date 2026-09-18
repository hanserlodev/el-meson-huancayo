import Link from "next/link";
import { MAPS_URL } from "@/lib/data";

export default function Footer() {
  return (
    <footer id="site-footer" className="mt-14 bg-ink text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div>
          <p className="flex items-center gap-2.5">
            <img
              src="/imagenes/logo.jpg"
              alt="Logo Pollos y Parrillas El Mesón"
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/15"
            />
            <span className="font-display text-lg font-bold text-white">El Mesón</span>
          </p>
          <p className="mt-2 text-slate-400">
            Empresa familiar huancaína desde 1985. Pollo a la brasa, parrillas al carbón y la famosa ensalada dulce.
          </p>
        </div>
        <nav aria-label="Explora">
          <p className="font-bold text-white mb-2 text-xs uppercase tracking-widest">Explora</p>
          <ul className="space-y-1.5">
            <li>
              <Link className="footer-link" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="footer-link" href="/carta">
                Carta
              </Link>
            </li>
            <li>
              <Link className="footer-link" href="/carrito">
                Carrito
              </Link>
            </li>
            <li>
              <Link className="footer-link" href="/reserva">
                Reservar mesa
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="font-bold text-white mb-2 text-xs uppercase tracking-widest">Horario</p>
          <p>
            Lun – Dom · 11:00 – 23:00
            <br />
            <a className="footer-link" href={MAPS_URL} target="_blank" rel="noopener">
              Av. Giráldez 157, Huancayo
            </a>
          </p>
        </div>
        <div>
          <p className="font-bold text-white mb-2 text-xs uppercase tracking-widest">Contacto</p>
          <p>
            Delivery: 939 399 946
            <br />
            932 619 097 · 972 346 842
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          © 2026 Pollos y Parrillas El Mesón — Proyecto de Práctica Web · Precios referenciales, confírmalos por WhatsApp
        </p>
      </div>
    </footer>
  );
}
