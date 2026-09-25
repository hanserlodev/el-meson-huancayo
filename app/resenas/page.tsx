"use client";
import { useEffect, useState } from "react";
import { subscribeResenas, crearResena, type ResenaDoc } from "@/lib/services/resenas.service";
import { PLATOS } from "@/lib/data";

export default function ResenasPage() {
  const [resenas, setResenas] = useState<ResenaDoc[]>([]);
  const [form, setForm] = useState({ platoId: PLATOS[0]?.id || "cuarto", nombre: "", rating: 5, comentario: "" });
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { const u = subscribeResenas(setResenas, undefined, true); return () => u(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    try { await crearResena({ platoId: form.platoId, nombre: form.nombre, rating: Number(form.rating), comentario: form.comentario }); setMsg("¡Gracias! Tu reseña quedó pendiente de aprobación."); setForm((f) => ({ ...f, nombre: "", comentario: "" })); } catch (err) { setMsg(err instanceof Error ? err.message : "Error"); }
  };
  return (
    <div className="min-h-screen bg-bg-canvas">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6"><a href="/" className="font-bold text-ink">← El Mesón</a><a href="/admin" className="text-sm text-slate-500">Admin</a></header>
      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-ink">Deja tu reseña ★★★★★</h1><p className="text-sm text-slate-500 mb-4">Cliente C/R — después de pedir, califica tu plato (pendiente → aprobada por admin)</p>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <select value={form.platoId} onChange={(e) => setForm({ ...form, platoId: e.target.value })} className="h-11 px-3 border rounded-lg">{PLATOS.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
            <input required placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="h-11 px-3 border rounded-lg" />
            <div className="flex items-center gap-2"><span className="text-sm">Rating</span>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className={`w-9 h-9 rounded-full ${form.rating >= n ? "bg-amber-400" : "bg-slate-100"}`}>★</button>)}<span className="text-sm font-bold">{form.rating}/5</span></div>
            <textarea required placeholder="Tu comentario (mín 5 caracteres)" value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} className="min-h-[90px] p-3 border rounded-lg" />
            <button type="submit" className="h-11 bg-brand-600 text-white rounded-lg font-semibold">Enviar reseña</button>
            {msg && <div className="text-sm p-3 rounded-lg bg-amber-50 text-amber-800">{msg}</div>}
          </form>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">Reseñas aprobadas ({resenas.length})</h2>
          <div className="flex flex-col gap-4">{resenas.map((r) => <div key={r.id} className="p-4 rounded-xl bg-slate-50 border"><div className="flex justify-between"><span className="font-semibold">{r.nombre}</span><span className="text-amber-500">{"★".repeat(r.rating)}</span></div><div className="text-xs text-slate-500">{r.platoId}</div><div className="text-sm mt-1">{r.comentario}</div></div>)}{!resenas.length && <div className="text-sm text-slate-400">Aún no hay reseñas aprobadas.</div>}</div>
        </div>
      </main>
    </div>
  );
}
