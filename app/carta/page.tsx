"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { subscribePlatos } from "@/lib/services/platos.service";
import { subscribeOfertas, type OfertaDoc } from "@/lib/services/ofertas.service";
import { useCart } from "@/lib/stores/cart";
import type { Plato } from "@/lib/data";
import { DELIVERY, ENVIO_GRATIS_DESDE } from "@/lib/data";

const CATS = [
  { id: "todos", label: "Todos" },
  { id: "brasa", label: "A la brasa" },
  { id: "parrilla", label: "Parrillas y cortes" },
  { id: "extra", label: "Guarniciones y bebidas" },
];

export default function CartaPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [ofertas, setOfertas] = useState<OfertaDoc[]>([]);
  const [cat, setCat] = useState("todos");
  const [q, setQ] = useState("");
  const { agregar, items, total, soles } = useCart();

  useEffect(() => {
    const u1 = subscribePlatos(setPlatos);
    const u2 = subscribeOfertas(setOfertas, true);
    return () => { u1(); u2(); };
  }, []);

  const filtrados = useMemo(() => {
    return platos.filter(p => {
      const okCat = cat==="todos" || p.cat===cat;
      const okQ = !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.desc.toLowerCase().includes(q.toLowerCase());
      const activo = p.activo!==false;
      return okCat && okQ && activo;
    });
  }, [platos, cat, q]);

  const falta = Math.max(0, ENVIO_GRATIS_DESDE - total);

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-20">
        {/* Header carta */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase">Carta Oficial · Huancayo</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="material-symbols-outlined text-[16px] text-amber-500">local_fire_department</span>Horno a Leña de Eucalipto</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-ink">Nuestra carta - <span className="text-brand-600">Brasa y parrillas</span></h1>
          <p className="text-sm text-slate-500 flex flex-wrap gap-2"> <span className="flex items-center gap-1 text-brand-600 font-medium"><span className="material-symbols-outlined text-[16px]">pin_drop</span>Av. Giráldez 157</span> · Precios en soles · <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">Delivery gratis desde S/ 35</span></p>
        </div>

        {/* Promos dinámicas */}
        {ofertas.length>0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {ofertas.slice(0,2).map(o=>(
              <div key={o.id} className={`${o.tipo==="martes"?"bg-ink text-white":"bg-brand-600 text-white"} rounded-xl p-6 flex items-center justify-between gap-4 shadow-md`}>
                <div>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-400 text-ink text-xs font-bold">{o.tipo}</span>
                  <h2 className="font-bold text-lg mt-1">{o.titulo}</h2>
                  <p className="text-sm opacity-80">{o.descripcion}</p>
                  {o.precioOferta && <p className="font-bold mt-1">S/ {o.precioOferta.toFixed(2)}</p>}
                </div>
                {o.activo && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="sticky top-[72px] z-20 bg-bg-canvas/95 backdrop-blur-md py-4 -mx-4 px-4 flex flex-col lg:flex-row gap-4 justify-between border-b border-slate-200 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} className={`px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${cat===c.id?"bg-ink text-white":"bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50"}`}>{c.label}</button>
            ))}
          </div>
          <div className="relative w-full lg:w-72 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar pollo, anticuchos, bife..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"/>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 2xl:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Platos populares</h2>
              <span className="text-sm text-slate-500">Mostrando {filtrados.length} de {platos.length}</span>
            </div>

            {filtrados.length===0 ? (
              <div className="bg-white rounded-xl p-12 text-center ring-1 ring-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                <p className="font-bold mt-2">Sin resultados</p>
                <p className="text-sm text-slate-500">Prueba con &quot;pollo&quot;, &quot;chicha&quot; o cambia de categoría</p>
                <button onClick={()=>{setQ(""); setCat("todos");}} className="mt-4 px-4 py-2 bg-ink text-white rounded-lg text-sm">Ver toda la carta</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filtrados.map(p=>(
                  <div key={p.id} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="relative h-48 bg-slate-100">
                      <img src={p.img} alt={p.nombre} className="w-full h-full object-cover"/>
                      {p.tag && <span className="absolute top-3 left-3 bg-amber-400 text-ink px-2.5 py-1 rounded-full text-xs font-bold">{p.tag}</span>}
                    </div>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <h3 className="font-bold text-ink">{p.nombre}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{p.desc}</p>
                      <div className="text-xs text-slate-400">{p.rating} · {p.votos} votos</div>
                    </div>
                    <div className="px-5 pb-5 flex items-center justify-between">
                      <div><div className="text-xs text-slate-500 uppercase font-semibold">Precio</div><div className="font-bold text-brand-600 text-lg">S/ {p.precio.toFixed(2)}</div></div>
                      <button onClick={()=>agregar(p.nombre, p.precio)} className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>Agregar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-emerald-600 text-white grid place-items-center"><span className="material-symbols-outlined">verified</span></span><div><div className="font-bold text-sm">Compromiso Calidad El Mesón</div><div className="text-xs text-slate-600">Pollos marinados 24h y horneados al carbón</div></div></div>
              <Link href="/reserva" className="shrink-0 px-4 py-2 rounded-lg bg-ink text-white text-sm font-semibold">Reservar Salón</Link>
            </div>
          </div>

          <aside className="xl:col-span-4 2xl:col-span-3 lg:sticky lg:top-28 hidden xl:block">
            <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-900/5 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between"><h4 className="font-bold text-ink">Mi Pedido</h4><Link href="/carrito" className="text-xs text-brand-600 font-semibold">Ver carrito →</Link></div>
              {items.length===0 ? (
                <div className="text-center py-6 text-sm text-slate-500">Tu pedido está vacío</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((it,i)=>(
                    <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-slate-50"><span>{it.cant}x {it.nombre}</span><span className="font-bold text-brand-600">S/ {soles(it.precio*it.cant)}</span></div>
                  ))}
                </div>
              )}
              <div className="p-3 rounded-lg bg-slate-100 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold"><span>Meta Delivery Gratis</span><span className="text-brand-600">{falta===0?"¡Gratis!":`Falta S/ ${soles(falta)}`}</span></div>
                <div className="h-2 bg-white rounded-full overflow-hidden"><div className="h-full bg-brand-600 transition-all" style={{width: `${Math.min(100, (total/ENVIO_GRATIS_DESDE)*100)}%`}}></div></div>
                <span className="text-[11px] text-slate-500">Gratis desde S/ {ENVIO_GRATIS_DESDE}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-semibold">S/ {soles(total)}</span></div>
              <div className="flex justify-between font-bold">Total<span className="text-brand-600">S/ {soles(total + (total>=ENVIO_GRATIS_DESDE?0: total?DELIVERY:0))}</span></div>
              <Link href="/carrito" className="w-full h-11 bg-ink text-white rounded-xl font-semibold grid place-items-center">Ir al Carrito</Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
