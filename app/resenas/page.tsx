"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { subscribeResenas, crearResena, type ResenaDoc } from "@/lib/services/resenas.service";
import { PLATOS, WHATSAPP } from "@/lib/data";

const platoNombre = (id: string) => PLATOS.find((p) => p.id === id)?.nombre ?? id;

export default function ResenasPage() {
  const [resenas, setResenas] = useState<ResenaDoc[]>([]);
  const [form, setForm] = useState({ platoId: PLATOS[0]?.id || "cuarto", nombre: "", rating: 5, comentario: "" });
  const [msg, setMsg] = useState<{ texto: string; ok: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const u = subscribeResenas(setResenas, undefined, true);
    return () => u();
  }, []);

  const promedio = useMemo(
    () => (resenas.length ? (resenas.reduce((a, r) => a + r.rating, 0) / resenas.length).toFixed(1) : null),
    [resenas]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setMsg(null);
    setEnviando(true);
    try {
      await crearResena({ platoId: form.platoId, nombre: form.nombre, rating: Number(form.rating), comentario: form.comentario });
      setMsg({ texto: "¡Gracias! Tu reseña quedó pendiente de aprobación.", ok: true });
      setForm((f) => ({ ...f, nombre: "", comentario: "" }));
    } catch (err) {
      setMsg({ texto: err instanceof Error ? err.message : "No se pudo enviar la reseña", ok: false });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />

      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">star</span>Reseñas Huancayo
          </span>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-ink mt-3">
            Lo que dicen de El Mesón <span className="text-brand-600">·</span> sabor desde 1985
          </h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Después de pedir, cuenta tu experiencia. Revisamos cada reseña antes de publicarla.
          </p>
          {promedio && (
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
                <span className="text-3xl font-display font-bold text-ink leading-none">{promedio}</span>
                <div>
                  <div className="text-amber-500 text-sm leading-none">{"★".repeat(Math.round(Number(promedio)))}{"☆".repeat(5 - Math.round(Number(promedio)))}</div>
                  <div className="text-xs text-slate-500 mt-1">{resenas.length} {resenas.length === 1 ? "reseña aprobada" : "reseñas aprobadas"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8 items-start">
        {/* FORMULARIO */}
        <section className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl shadow-md ring-1 ring-slate-900/5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 font-bold text-ink mb-1">
            <span className="material-symbols-outlined text-brand-600">rate_review</span>Deja tu reseña
          </div>
          <p className="text-sm text-slate-500 mb-5">Califica tu plato favorito. Quedará visible al ser aprobada.</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
              Plato
              <select value={form.platoId} onChange={(e) => setForm({ ...form, platoId: e.target.value })} className="h-11 px-3 bg-slate-100 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600">
                {PLATOS.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
              Tu nombre
              <input required maxLength={60} placeholder="Ej. Carlos Mendoza" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="h-11 px-4 bg-slate-100 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Tu calificación</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} estrellas`}
                    className={`w-10 h-10 grid place-items-center rounded-full text-xl transition-colors ${form.rating >= n ? "bg-amber-400 text-ink" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-sm font-bold text-ink ml-1">{form.rating}/5</span>
              </div>
            </div>

            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
              Tu comentario
              <textarea required minLength={5} maxLength={500} rows={4} placeholder="¿Cómo estuvo el pollo, las papas y la atención?" value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} className="p-3 bg-slate-100 rounded-lg text-sm text-ink focus:outline-none focus:bg-white ring-1 ring-transparent focus:ring-brand-600" />
            </label>

            <button type="submit" disabled={enviando} className="h-12 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>{enviando ? "Enviando..." : "Enviar reseña"}
            </button>
            {msg && (
              <div className={`text-sm p-3 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.texto}</div>
            )}
          </form>
        </section>

        {/* LISTADO */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink text-lg">Reseñas de clientes</h2>
            <Link href="/carta" className="inline-flex items-center gap-1 text-brand-600 font-semibold text-sm hover:gap-2 transition-all">
              Ver la carta<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {resenas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-slate-200 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-5xl text-slate-300">reviews</span>
              <p className="font-bold text-ink">Aún no hay reseñas publicadas</p>
              <p className="text-sm text-slate-500">Sé el primero en contarnos tu experiencia.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {resenas.map((r) => (
                <article key={r.id} className="bg-white p-5 rounded-2xl ring-1 ring-slate-900/5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-orange-100 text-brand-700 grid place-items-center font-bold uppercase">
                      {r.nombre.trim().charAt(0) || "?"}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink truncate">{r.nombre}</div>
                      <div className="text-xs text-slate-500 truncate">{platoNombre(r.platoId)}</div>
                    </div>
                    <span className="ml-auto text-amber-500 text-sm shrink-0">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comentario}</p>
                </article>
              ))}
            </div>
          )}

          <div className="mt-6 p-5 rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-600">¿Prefieres pedir directo? Te tomamos el pedido por WhatsApp.</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shrink-0">
              <span className="material-symbols-outlined text-[18px]">chat</span>WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
