"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { subscribeOfertas, type OfertaDoc, type TipoOferta } from "@/lib/services/ofertas.service";
import { ENVIO_GRATIS_DESDE, WHATSAPP } from "@/lib/data";

const CATS: { id: TipoOferta | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "martes", label: "Martes de pollo" },
  { id: "combo", label: "Combos" },
  { id: "delivery", label: "Delivery" },
  { id: "descuento", label: "Descuentos" },
];

const META: Record<TipoOferta, { icon: string; band: string; chip: string; label: string }> = {
  martes: { icon: "local_fire_department", band: "from-brand-600 to-orange-700", chip: "bg-amber-400 text-ink", label: "Martes de brasa" },
  combo: { icon: "restaurant", band: "from-ink to-slate-800", chip: "bg-amber-400 text-ink", label: "Combo familiar" },
  delivery: { icon: "moped", band: "from-emerald-600 to-emerald-700", chip: "bg-white/90 text-emerald-700", label: "Delivery" },
  descuento: { icon: "sell", band: "from-amber-500 to-orange-600", chip: "bg-ink text-white", label: "Descuento" },
};

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaDoc[]>([]);
  const [cat, setCat] = useState<TipoOferta | "todas">("todas");

  useEffect(() => {
    const u = subscribeOfertas(setOfertas, true);
    return () => u();
  }, []);

  const filtradas = useMemo(
    () => (cat === "todas" ? ofertas : ofertas.filter((o) => o.tipo === cat)),
    [ofertas, cat]
  );

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />

      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">local_offer</span>Promociones Huancayo
          </span>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-ink mt-3">
            Ofertas de la casa <span className="text-brand-600">·</span> brasa que rinde
          </h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Promociones vigentes de El Mesón: martes de pollo, combos familiares y delivery gratis desde S/ {ENVIO_GRATIS_DESDE}. Aprovecha antes de que se agoten.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/carta" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-pop transition-colors">
              <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>Ver la carta
            </Link>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-white font-semibold hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chat</span>Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold shrink-0 transition-colors ${cat === c.id ? "bg-ink text-white" : "bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500">
            {ofertas.length} {ofertas.length === 1 ? "oferta activa" : "ofertas activas"}
          </span>
        </div>

        {/* Grid */}
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-slate-200 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-slate-300">local_offer</span>
            <p className="font-bold text-ink">Sin ofertas por aquí</p>
            <p className="text-sm text-slate-500">Prueba con otra categoría o revisa toda la carta.</p>
            <Link href="/carta" className="mt-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
              Explorar la carta
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((o) => {
              const m = META[o.tipo];
              return (
                <article key={o.id} className="bg-white rounded-3xl overflow-hidden ring-1 ring-slate-900/5 shadow-sm hover:shadow-md transition flex flex-col">
                  <div className={`h-28 bg-gradient-to-br ${m.band} relative grid place-items-center`}>
                    <span className="material-symbols-outlined text-5xl text-white/90">{m.icon}</span>
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${m.chip}`}>{m.label}</span>
                  </div>
                  <div className="p-6 flex flex-col gap-2 flex-1">
                    <h3 className="font-display font-bold text-lg text-ink leading-tight">{o.titulo}</h3>
                    <p className="text-sm text-slate-500 flex-1">{o.descripcion || "Promoción especial de El Mesón."}</p>
                    {o.precioOferta ? (
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-sm font-semibold text-slate-400">S/</span>
                        <span className="text-3xl font-bold text-brand-600 leading-none">{Number(o.precioOferta).toFixed(2)}</span>
                        <span className="text-xs text-slate-400 ml-1">precio promocional</span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-brand-600 mt-2">Consulta el precio en carta</div>
                    )}
                  </div>
                  <div className="px-6 pb-6 flex gap-2">
                    <Link href="/carta" className="flex-1 h-11 grid place-items-center bg-ink text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">
                      Pedir ahora
                    </Link>
                    <a
                      href={`https://wa.me/${WHATSAPP}`}
                      target="_blank"
                      rel="noopener"
                      aria-label={`Consultar ${o.titulo} por WhatsApp`}
                      className="w-11 h-11 grid place-items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA final */}
        <section className="mt-10">
          <div className="bg-ink rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-white relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl"></div>
            <div className="relative">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">¿Mesa para hoy?</span>
              <h2 className="text-2xl font-display font-bold mt-1">Reserva y llega a pollo caliente</h2>
              <p className="text-slate-300 mt-2 max-w-xl">Asegura tu mesa en Giráldez 157 o Calle Real 919, o pide delivery al {WHATSAPP.slice(2)}.</p>
            </div>
            <Link href="/reserva" className="relative shrink-0 inline-flex h-12 px-6 rounded-2xl bg-amber-400 text-ink font-bold hover:bg-yellow-400 transition-colors">
              Reservar ahora
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
