"use client";
import { useEffect, useState } from "react";
import { subscribeOfertas, type OfertaDoc } from "@/lib/services/ofertas.service";
export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaDoc[]>([]);
  useEffect(() => { const u = subscribeOfertas(setOfertas, true); return () => u(); }, []);
  return (
    <div className="min-h-screen bg-bg-canvas">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6"><a href="/" className="font-bold">← El Mesón</a><a href="/carta" className="text-sm text-slate-500">Ver carta</a></header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-ink">Ofertas activas</h1><p className="text-sm text-slate-500 mb-6">Cliente R — banners que antes eran fijos, ahora desde Firestore</p>
        <div className="grid md:grid-cols-3 gap-4">{ofertas.map((o) => <div key={o.id} className="p-6 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white"><div className="text-xs uppercase tracking-wider opacity-80">{o.tipo}</div><div className="text-xl font-bold">{o.titulo}</div><div className="text-sm opacity-90">{o.descripcion}</div>{o.precioOferta && <div className="mt-2 text-2xl font-bold">S/ {Number(o.precioOferta).toFixed(2)}</div>}</div>)}{!ofertas.length && <div className="col-span-3 text-center py-12 text-slate-400">Sin ofertas activas</div>}</div>
      </main>
    </div>
  );
}
