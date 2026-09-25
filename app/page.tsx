"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { subscribePlatos } from "@/lib/services/platos.service";
import { useCart } from "@/lib/stores/cart";
import type { Plato } from "@/lib/data";

export default function InicioPage() {
  const [favoritos, setFavoritos] = useState<Plato[]>([]);
  const { agregar } = useCart();
  useEffect(() => {
    const u = subscribePlatos((platos) => {
      // top 3: primero por votos/tag, filtrando activos
      const activos = platos.filter(p=>p.activo!==false);
      const top = [...activos].sort((a,b)=> (b.votos||0)-(a.votos||0)).slice(0,3);
      setFavoritos(top.length? top: activos.slice(0,3));
    });
    return ()=>u();
  }, []);

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <main>
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 pt-8 pb-16 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold shadow-sm w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>Empresa familiar huancaína · Desde 1985
            </div>
            <h1 className="font-display font-bold text-4xl lg:text-5xl tracking-tight text-ink leading-[1.1]">El pollo a la brasa <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-orange-600 to-brand-800">que Huancayo ama.</span></h1>
            <p className="text-slate-600 mt-4 max-w-xl leading-relaxed">Receta de la casa al carbón, papas crocantes, cremas concentradas y la famosa ensalada dulce. En pleno centro: <span className="font-semibold text-ink">Av. Giráldez 157</span>.</p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/carta" className="inline-flex h-12 px-6 rounded-xl bg-ink text-white font-semibold hover:bg-slate-800">Ver carta</Link>
              <Link href="/reserva" className="inline-flex h-12 px-6 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-pop">Reservar mesa</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
              <div><div className="text-xs uppercase tracking-wider text-slate-500">Desde</div><div className="text-2xl font-bold text-ink">1985</div></div>
              <div><div className="text-xs uppercase tracking-wider text-slate-500">1/4 de pollo</div><div className="text-2xl font-bold text-brand-600">S/ 10.90</div></div>
              <div><div className="text-xs uppercase tracking-wider text-slate-500">Delivery</div><div className="text-lg font-bold text-ink truncate">939 399 946</div></div>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
              <img src="/imagenes/cuarto-brasa.png" alt="Pollo a la brasa El Mesón" className="w-full h-[480px] object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
              <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/95 text-ink text-sm font-bold shadow flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping"></span>Más pedido · 1/4 a S/ 10.90</div>
              <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-ink/90 text-white text-sm flex items-center gap-2"><span className="material-symbols-outlined text-amber-400 text-[18px]">local_shipping</span>Delivery gratis desde S/ 35</div>
            </div>
          </div>
        </section>

        {/* Favoritos dinámicos desde Firestore */}
        <section className="w-full bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div><div className="text-xs uppercase tracking-widest text-brand-600 font-bold">Los favoritos</div><h2 className="text-3xl font-bold text-ink">Lo más pedido de la casa</h2></div>
              <Link href="/carta" className="inline-flex items-center gap-1 text-brand-600 font-bold hover:gap-2 transition-all">Ver carta completa <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {favoritos.map(p=>(
                <div key={p.id} className="bg-bg-canvas rounded-3xl overflow-hidden ring-1 ring-slate-900/5 shadow-sm hover:shadow-md transition flex flex-col">
                  <div className="h-56 bg-slate-100 relative"><img src={p.img} alt={p.nombre} className="w-full h-full object-cover"/>{p.tag && <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-ink text-xs font-bold">{p.tag||"Top"}</span>}</div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-ink">{p.nombre}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{p.desc}</p>
                    <div className="text-xs text-slate-400 mt-1">{p.rating} · {p.votos} votos</div>
                    <div className="mt-4 flex items-center justify-between"><span className="font-bold text-lg text-ink">S/ {p.precio.toFixed(2)}</span><button onClick={()=>agregar(p.nombre, p.precio)} className="h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-brand-700"><span>Agregar</span><span className="material-symbols-outlined text-[18px]">add</span></button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
          {[
            {icon:"local_fire_department", t:"Leña y carbón de verdad", d:"Pollo jugoso por dentro y crocante por fuera, sabor ahumado desde 1985."},
            {icon:"star", t:"Ensalada dulce + cremas", d:"La exquisita ensalada dulce y cremas bien concentradas que todos destacan."},
            {icon:"location_on", t:"En pleno centro", d:"Av. Giráldez 157, frente al parque. También Calle Real 919."},
          ].map(c=>(
            <div key={c.t} className="bg-white p-8 rounded-3xl ring-1 ring-slate-900/5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-brand-600 grid place-items-center mb-4"><span className="material-symbols-outlined text-[28px]">{c.icon}</span></div>
              <h3 className="font-bold text-ink mb-2">{c.t}</h3><p className="text-sm text-slate-600">{c.d}</p>
            </div>
          ))}
        </section>

        {/* Banner reserva */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="bg-ink rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-white relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-brand-600/20 blur-3xl"></div>
            <div className="relative"><span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Atención de primera</span><h2 className="text-3xl font-bold mt-1">¿Mesa para hoy?</h2><p className="text-slate-300 mt-2">Reserva en Giráldez 157 en menos de un minuto, o pide por WhatsApp al <b className="text-white">939 399 946</b>.</p></div>
            <Link href="/reserva" className="relative shrink-0 inline-flex h-14 px-8 rounded-2xl bg-amber-400 text-ink font-bold hover:bg-yellow-400">Reservar ahora <span className="material-symbols-outlined ml-2">calendar_month</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
