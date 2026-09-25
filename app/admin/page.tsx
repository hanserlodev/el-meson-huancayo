"use client";
import { useEffect, useState } from "react";
import { PLATOS as PLATOS_INIT, type Plato } from "@/lib/data";
import { createPlato, deletePlato, subscribePlatos, updatePlato } from "@/lib/services/platos.service";
import { subscribeCategorias, createCategoria, updateCategoria, deleteCategoria, type CategoriaDoc, CATEGORIAS_LOCAL } from "@/lib/services/categorias.service";
import { subscribeOfertas, createOferta, updateOferta, deleteOferta, type OfertaDoc, type TipoOferta } from "@/lib/services/ofertas.service";
import { subscribePedidos, updateEstadoPedido, deletePedido, type PedidoDoc, type EstadoPedido } from "@/lib/services/pedidos.service";
import { subscribeReservas, updateEstadoReserva, deleteReserva, type ReservaDoc, type EstadoReserva } from "@/lib/services/reservas.service";
import { subscribeResenas, updateEstadoResena, deleteResena, type ResenaDoc } from "@/lib/services/resenas.service";

type Tab = "platos" | "categorias" | "ofertas" | "pedidos" | "reservas" | "resenas";
type Stock = "Activo" | "Bajo" | "Agotado";
interface AdminPlato extends Plato { activo: boolean; stock: Stock; }

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("platos");

  // --- Platos ---
  const [platos, setPlatos] = useState<AdminPlato[]>(PLATOS_INIT.map((p) => ({ ...p, activo: true, stock: "Activo" as Stock })));
  const [search, setSearch] = useState(""); const [catFilter, setCatFilter] = useState("todas");
  const [showForm, setShowForm] = useState(false); const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cat: "Brasas", precio: "", stock: "Activo" as Stock, desc: "" });
  useEffect(() => { const u = subscribePlatos((d) => { if (d.length) setPlatos(d.map((p) => ({ ...p, activo: (p as AdminPlato).activo ?? true, stock: "Activo" } as AdminPlato))); }); return () => u(); }, []);
  const filtered = platos.filter((p) => { const ms = p.nombre.toLowerCase().includes(search.toLowerCase()); const mc = catFilter === "todas" || p.cat.toLowerCase() === catFilter.toLowerCase() || (catFilter === "Brasas" && p.cat === "brasa") || (catFilter === "Parrillas" && p.cat === "parrilla") || (catFilter === "Bebidas" && p.cat === "extra"); return ms && mc; });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const precio = parseFloat(form.precio); if (!form.nombre || isNaN(precio) || precio <= 0) return;
    const catMap: Record<string, Plato["cat"]> = { Brasas: "brasa", Parrillas: "parrilla", Bebidas: "extra", Guarniciones: "extra" }; const cat = catMap[form.cat] || "brasa";
    if (editingId) {
      const upd: Partial<Plato> = { nombre: form.nombre, precio, cat, desc: form.desc, tag: form.stock === "Agotado" ? "Agotado" : "" };
      try { await updatePlato(editingId, upd); } catch {}
      setPlatos((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...upd, stock: form.stock, activo: form.stock !== "Agotado" } as AdminPlato : p)));
    } else {
      const np: Plato = { id: `plato-${Date.now()}`, nombre: form.nombre, precio, cat, desc: form.desc || "Receta especial de la casa", img: "/imagenes/cuarto-brasa.png", tag: form.stock === "Agotado" ? "Agotado" : "", rating: "★★★★★", votos: 0, activo: form.stock !== "Agotado" };
      try { await createPlato(np); } catch {}
      setPlatos((prev) => [{ ...np, stock: form.stock } as AdminPlato, ...prev]);
    }
    setShowForm(false); setEditingId(null); setForm({ nombre: "", cat: "Brasas", precio: "", stock: "Activo", desc: "" });
  };
  const editDish = (p: AdminPlato) => { setEditingId(p.id); setForm({ nombre: p.nombre, cat: p.cat === "brasa" ? "Brasas" : p.cat === "parrilla" ? "Parrillas" : "Bebidas", precio: String(p.precio), stock: p.stock, desc: p.desc }); setShowForm(true); };
  const delDish = async (id: string) => { if (!confirm("¿Eliminar plato?")) return; try { await deletePlato(id); } catch {} setPlatos((prev) => prev.filter((p) => p.id !== id)); };
  const toggleStock = (id: string) => setPlatos((prev) => prev.map((p) => p.id !== id ? p : { ...p, stock: p.stock === "Activo" ? "Agotado" : p.stock === "Agotado" ? "Bajo" : "Activo", activo: (p.stock === "Activo" ? "Agotado" : p.stock === "Agotado" ? "Bajo" : "Activo") !== "Agotado" }));

  // --- Categorias ---
  const [categorias, setCategorias] = useState<CategoriaDoc[]>(CATEGORIAS_LOCAL);
  const [catForm, setCatForm] = useState({ nombre: "", slug: "", orden: "1", activo: true }); const [catEdit, setCatEdit] = useState<string | null>(null); const [showCat, setShowCat] = useState(false);
  useEffect(() => { const u = subscribeCategorias(setCategorias); return () => u(); }, []);
  const submitCat = async (e: React.FormEvent) => {
    e.preventDefault(); if (!catForm.nombre) return;
    const slug = catForm.slug || catForm.nombre.toLowerCase().replace(/\s+/g, "-");
    const data = { nombre: catForm.nombre, slug, orden: Number(catForm.orden) || 1, activo: catForm.activo };
    try { if (catEdit) await updateCategoria(catEdit, data); else await createCategoria(data); } catch {}
    if (catEdit) setCategorias((p) => p.map((c) => c.id === catEdit ? { ...c, ...data } : c)); else setCategorias((p) => [{ id: `cat-${Date.now()}`, ...data }, ...p]);
    setShowCat(false); setCatEdit(null); setCatForm({ nombre: "", slug: "", orden: "1", activo: true });
  };

  // --- Ofertas ---
  const [ofertas, setOfertas] = useState<OfertaDoc[]>([]); const [ofForm, setOfForm] = useState({ titulo: "", descripcion: "", tipo: "martes" as TipoOferta, precioOferta: "", activo: true }); const [ofEdit, setOfEdit] = useState<string | null>(null); const [showOf, setShowOf] = useState(false);
  useEffect(() => { const u = subscribeOfertas(setOfertas); return () => u(); }, []);
  const submitOf = async (e: React.FormEvent) => {
    e.preventDefault(); if (!ofForm.titulo) return;
    const data: Omit<OfertaDoc, "id"> = { titulo: ofForm.titulo, descripcion: ofForm.descripcion, tipo: ofForm.tipo, precioOferta: ofForm.precioOferta ? Number(ofForm.precioOferta) : undefined, activo: ofForm.activo };
    try { if (ofEdit) await updateOferta(ofEdit, data); else await createOferta(data); } catch {}
    if (ofEdit) setOfertas((p) => p.map((o) => o.id === ofEdit ? { ...o, ...data } : o)); else setOfertas((p) => [{ id: `of-${Date.now()}`, ...data }, ...p]);
    setShowOf(false); setOfEdit(null); setOfForm({ titulo: "", descripcion: "", tipo: "martes", precioOferta: "", activo: true });
  };

  // --- Pedidos ---
  const [pedidos, setPedidos] = useState<PedidoDoc[]>([]); useEffect(() => { const u = subscribePedidos(setPedidos); return () => u(); }, []);
  const cambiarEstadoPedido = async (id: string, estado: EstadoPedido) => { try { await updateEstadoPedido(id, estado); } catch {} setPedidos((p) => p.map((x) => x.id === id ? { ...x, estado } : x)); };

  // --- Reservas ---
  const [reservas, setReservas] = useState<ReservaDoc[]>([]); useEffect(() => { const u = subscribeReservas(setReservas); return () => u(); }, []);
  const cambiarEstadoReserva = async (id: string, estado: EstadoReserva) => { try { await updateEstadoReserva(id, estado); } catch {} setReservas((p) => p.map((x) => x.id === id ? { ...x, estado } : x)); };

  // --- Resenas ---
  const [resenas, setResenas] = useState<ResenaDoc[]>([]); useEffect(() => { const u = subscribeResenas(setResenas); return () => u(); }, []);
  const moderar = async (id: string, estado: ResenaDoc["estado"]) => { try { await updateEstadoResena(id, estado); } catch {} setResenas((p) => p.map((r) => r.id === id ? { ...r, estado } : r)); };

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "platos", label: "Platos", icon: "restaurant_menu", count: platos.length },
    { id: "categorias", label: "Categorías", icon: "category", count: categorias.length },
    { id: "ofertas", label: "Ofertas", icon: "local_offer", count: ofertas.length },
    { id: "pedidos", label: "Pedidos", icon: "receipt_long", count: pedidos.length },
    { id: "reservas", label: "Reservas", icon: "event_seat", count: reservas.length },
    { id: "resenas", label: "Reseñas", icon: "star", count: resenas.length },
  ];

  return (
    <div className="min-h-screen bg-bg-canvas">
      <div className="flex">
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-on-background text-surface flex-col justify-between z-40">
          <div className="flex flex-col">
            <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
              <img src="/imagenes/logo.jpg" alt="Logo El Mesón" className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20" />
              <div className="flex flex-col"><span className="font-bold text-surface">El Mesón</span><span className="text-xs text-primary-fixed uppercase tracking-wider">Panel de Control</span></div>
            </div>
            <div className="p-4">
              <p className="px-3 mb-2 text-xs uppercase tracking-wider text-white/50">Gestión Operativa — 6 CRUDs</p>
              <nav className="flex flex-col gap-1">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${tab === t.id ? "bg-primary text-on-primary font-semibold" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                    <span className="material-symbols-outlined text-[20px]">{t.icon}</span>{t.label} <span className="ml-auto text-xs opacity-60">{t.count ?? 0}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="p-4 border-t border-white/10"><a href="/" className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm"><span className="material-symbols-outlined text-[18px]">storefront</span>Volver a la Tienda</a></div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 z-30 flex items-center justify-between px-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Sede Activa: Giráldez 157</span>
            <span className="text-sm text-slate-500">6 CRUDs · Firestore + fallback local</span>
          </header>

          <main className="px-6 py-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
              {[["Platos", platos.length, "restaurant_menu"], ["Categorías", categorias.length, "category"], ["Ofertas", ofertas.length, "local_offer"], ["Pedidos", pedidos.length, "receipt_long"], ["Reservas", reservas.length, "event_seat"], ["Reseñas", resenas.filter((r) => r.estado === "pendiente").length + " pend.", "star"]].map(([label, val, icon]) => (
                <div key={String(label)} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between"><div><span className="text-xs uppercase tracking-wider text-slate-500">{String(label)}</span><div className="text-2xl font-bold text-ink">{String(val)}</div></div><span className="material-symbols-outlined text-2xl text-brand-600">{String(icon)}</span></div>
              ))}
            </div>

            {/* Mobile tabs */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-4">
              {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tab === t.id ? "bg-ink text-white" : "bg-white border"}`}>{t.label} ({t.count})</button>)}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* PLATOS */}
              {tab === "platos" && (
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative min-w-[260px] flex-1 max-w-md"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar plato..." className="w-full h-11 pl-10 pr-4 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" /></div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">{["todas", "Brasas", "Parrillas", "Bebidas"].map((c) => <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${catFilter === c ? "bg-white shadow text-ink" : "text-slate-500"}`}>{c === "todas" ? "Todas" : c}</button>)}</div>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nombre: "", cat: "Brasas", precio: "", stock: "Activo", desc: "" }); }} className="h-11 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">add</span>Nuevo Plato</button>
                  </div>
                  {showForm && (
                    <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-600">Nombre *</label><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="1/4 Pollo a la Brasa" className="h-11 px-3.5 bg-white rounded-lg text-sm border" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Categoría</label><select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="h-11 px-3 bg-white rounded-lg text-sm border"><option>Brasas</option><option>Parrillas</option><option>Bebidas</option><option>Guarniciones</option></select></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Precio S/ *</label><input required type="number" step="0.1" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="10.90" className="h-11 px-3 bg-white rounded-lg text-sm border" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Estado</label><select value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value as Stock })} className="h-11 px-3 bg-white rounded-lg text-sm border"><option>Activo</option><option>Bajo</option><option>Agotado</option></select></div>
                      <div className="md:col-span-3 flex flex-col gap-1.5"><label className="text-xs font-semibold">Descripción</label><input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Incluye papas, ensalada..." className="h-11 px-3.5 bg-white rounded-lg text-sm border" /></div>
                      <div className="flex items-end gap-2"><button type="submit" className="w-full h-11 bg-ink text-white rounded-lg font-semibold flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span>Guardar</button><button type="button" onClick={() => setShowForm(false)} className="h-11 px-4 bg-white border rounded-lg">Cancelar</button></div>
                    </form>
                  )}
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm"><thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><th className="py-3 px-4">Plato</th><th className="py-3 px-4">Cat</th><th className="py-3 px-4">Precio</th><th className="py-3 px-4">Estado</th><th className="py-3 px-4 text-right">Acciones</th></tr></thead>
                      <tbody>{filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 border-t"><td className="py-3.5 px-4"><div className="flex items-center gap-3"><img src={p.img} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" /><div><div className="font-semibold text-ink">{p.nombre}</div><div className="text-xs text-slate-500 truncate max-w-[220px]">{p.desc}</div></div></div></td><td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100">{p.cat}</span></td><td className="py-3.5 px-4 font-bold">S/ {p.precio.toFixed(2)}</td><td className="py-3.5 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock === "Activo" ? "bg-emerald-50 text-emerald-700" : p.stock === "Bajo" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>{p.stock}</span></td><td className="py-3.5 px-4 text-right"><div className="inline-flex gap-1.5"><button onClick={() => editDish(p)} className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center"><span className="material-symbols-outlined text-[16px]">edit</span></button><button onClick={() => toggleStock(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center"><span className="material-symbols-outlined text-[16px]">sync_alt</span></button><button onClick={() => delDish(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center"><span className="material-symbols-outlined text-[16px]">delete</span></button></div></td></tr>
                      ))}</tbody></table>
                  </div>
                </div>
              )}

              {/* CATEGORIAS */}
              {tab === "categorias" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-ink text-lg">Categorías — hoy hardcodeadas, ahora CRUD</h3><button onClick={() => { setShowCat(!showCat); setCatEdit(null); setCatForm({ nombre: "", slug: "", orden: String(categorias.length + 1), activo: true }); }} className="h-11 px-5 rounded-lg bg-brand-600 text-white font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">add</span>Nueva Categoría</button></div>
                  {showCat && (
                    <form onSubmit={submitCat} className="mb-6 p-6 rounded-xl bg-slate-50 grid md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Nombre *</label><input required value={catForm.nombre} onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })} placeholder="Bebidas" className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Slug</label><input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="bebidas" className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Orden</label><input type="number" value={catForm.orden} onChange={(e) => setCatForm({ ...catForm, orden: e.target.value })} className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={catForm.activo} onChange={(e) => setCatForm({ ...catForm, activo: e.target.checked })} />Activo</label><button type="submit" className="ml-auto h-11 px-5 bg-ink text-white rounded-lg font-semibold">Guardar</button><button type="button" onClick={() => setShowCat(false)} className="h-11 px-4 bg-white border rounded-lg">Cancelar</button></div>
                    </form>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categorias.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col gap-3">
                        <div className="flex justify-between"><span className="font-bold text-ink">{c.nombre}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-200"}`}>{c.activo ? "Activo" : "Oculto"}</span></div>
                        <div className="text-xs text-slate-500">/{c.slug} · orden {c.orden}</div>
                        <div className="flex gap-2"><button onClick={() => { setCatEdit(c.id); setCatForm({ nombre: c.nombre, slug: c.slug, orden: String(c.orden), activo: c.activo }); setShowCat(true); }} className="flex-1 h-8 bg-white border rounded-lg text-xs font-semibold">Editar</button><button onClick={async () => { if (!confirm("¿Eliminar categoría?")) return; try { await deleteCategoria(c.id); } catch {} setCategorias((p) => p.filter((x) => x.id !== c.id)); }} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Borrar</button></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OFERTAS */}
              {tab === "ofertas" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6"><div><h3 className="font-bold text-ink text-lg">Ofertas — banners de /carta y /</h3><p className="text-sm text-slate-500">Martes S/13.90 / Combo 46.90 / Delivery — antes fijos, ahora CRUD + toggle Activo/Agotado</p></div><button onClick={() => { setShowOf(!showOf); setOfEdit(null); setOfForm({ titulo: "", descripcion: "", tipo: "martes", precioOferta: "", activo: true }); }} className="h-11 px-5 rounded-lg bg-brand-600 text-white font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">add</span>Nueva Oferta</button></div>
                  {showOf && (
                    <form onSubmit={submitOf} className="mb-6 p-6 rounded-xl bg-slate-50 grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 flex flex-col gap-1.5"><label className="text-xs font-semibold">Título *</label><input required value={ofForm.titulo} onChange={(e) => setOfForm({ ...ofForm, titulo: e.target.value })} placeholder="Martes de Pollo — S/ 13.90" className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Tipo</label><select value={ofForm.tipo} onChange={(e) => setOfForm({ ...ofForm, tipo: e.target.value as TipoOferta })} className="h-11 px-3 bg-white rounded-lg border text-sm"><option value="martes">martes</option><option value="combo">combo</option><option value="delivery">delivery</option><option value="descuento">descuento</option></select></div>
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold">Precio oferta S/</label><input type="number" step="0.1" value={ofForm.precioOferta} onChange={(e) => setOfForm({ ...ofForm, precioOferta: e.target.value })} placeholder="13.90" className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="md:col-span-3 flex flex-col gap-1.5"><label className="text-xs font-semibold">Descripción</label><input value={ofForm.descripcion} onChange={(e) => setOfForm({ ...ofForm, descripcion: e.target.value })} placeholder="1/4 pollo + papas + ensalada" className="h-11 px-3 bg-white rounded-lg border text-sm" /></div>
                      <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ofForm.activo} onChange={(e) => setOfForm({ ...ofForm, activo: e.target.checked })} />Activo</label><button type="submit" className="ml-auto h-11 px-5 bg-ink text-white rounded-lg font-semibold">Guardar</button><button type="button" onClick={() => setShowOf(false)} className="h-11 px-4 bg-white border rounded-lg">Cancelar</button></div>
                    </form>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    {ofertas.map((o) => (
                      <div key={o.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col gap-3">
                        <div className="flex justify-between"><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{o.tipo}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${o.activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{o.activo ? "Activo" : "Agotado"}</span></div>
                        <div><div className="font-bold text-ink">{o.titulo}</div><div className="text-sm text-slate-500">{o.descripcion}</div>{o.precioOferta && <div className="font-bold text-brand-600">S/ {Number(o.precioOferta).toFixed(2)}</div>}</div>
                        <div className="flex gap-2"><button onClick={() => { setOfEdit(o.id); setOfForm({ titulo: o.titulo, descripcion: o.descripcion, tipo: o.tipo, precioOferta: o.precioOferta ? String(o.precioOferta) : "", activo: o.activo }); setShowOf(true); }} className="flex-1 h-8 bg-white border rounded-lg text-xs font-semibold">Editar</button><button onClick={async () => { try { await updateOferta(o.id, { activo: !o.activo }); } catch {} setOfertas((p) => p.map((x) => x.id === o.id ? { ...x, activo: !x.activo } : x)); }} className="h-8 px-3 bg-slate-900 text-white rounded-lg text-xs">Toggle</button><button onClick={async () => { if (!confirm("¿Borrar oferta?")) return; try { await deleteOferta(o.id); } catch {} setOfertas((p) => p.filter((x) => x.id !== o.id)); }} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs">Borrar</button></div>
                      </div>
                    ))}
                    {!ofertas.length && <div className="col-span-3 text-center py-8 text-slate-400">Sin ofertas — crea Martes 13.90 / Combo 46.90</div>}
                  </div>
                </div>
              )}

              {/* PEDIDOS */}
              {tab === "pedidos" && (
                <div className="p-6">
                  <h3 className="font-bold text-ink text-lg">Pedidos Delivery — estados: pendiente → enHorno → enCamino → entregado</h3><p className="text-sm text-slate-500 mb-4">C/R desde /carrito (crearPedido) · R/U/D aquí — {pedidos.length} comandas</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pedidos.map((o) => (
                      <div key={o.id} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-3">
                        <div className="flex justify-between"><span className="font-bold text-brand-600 text-xs">#{o.id.slice(0, 6)}</span><span className="text-xs text-slate-500">{o.cliente?.tel || "—"}</span></div>
                        <div className="text-sm">{o.items?.map((it) => `${it.cant}x ${it.nombre}`).join(", ") || "—"}<div className="font-bold text-ink">S/ {Number(o.total || 0).toFixed(2)}</div></div>
                        <select value={o.estado} onChange={(e) => cambiarEstadoPedido(o.id, e.target.value as EstadoPedido)} className="h-8 px-2 rounded-lg border text-xs font-semibold">
                          <option value="pendiente">pendiente</option><option value="enHorno">enHorno</option><option value="enCamino">enCamino</option><option value="entregado">entregado</option><option value="cancelado">cancelado</option>
                        </select>
                        <button onClick={async () => { if (!confirm("¿Borrar pedido?")) return; try { await deletePedido(o.id); } catch {} setPedidos((p) => p.filter((x) => x.id !== o.id)); }} className="h-8 bg-red-50 text-red-600 rounded-lg text-xs">Borrar</button>
                      </div>
                    ))}
                    {!pedidos.length && <div className="col-span-4 text-center py-8 text-slate-400">Sin pedidos — agrega al carrito y pide en /carrito</div>}
                  </div>
                </div>
              )}

              {/* RESERVAS */}
              {tab === "reservas" && (
                <div className="p-6">
                  <h3 className="font-bold text-ink text-lg">Control de Reservas de Salón — 1 a 20 personas, 11:00–23:00</h3><p className="text-sm text-slate-500 mb-4">C/R desde /reserva · R/U/D aquí — {reservas.length} reservas</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {reservas.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-3">
                        <div className="flex justify-between"><div><div className="font-bold text-ink">{r.nombre}</div><div className="text-xs text-slate-500">{r.personas} pers · {r.fecha} {r.hora} · {r.sede || "Giráldez"}</div></div><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.estado === "confirmada" ? "bg-emerald-50 text-emerald-700" : r.estado === "pendiente" ? "bg-amber-50 text-amber-700" : r.estado === "sentada" ? "bg-slate-200" : "bg-red-50 text-red-600"}`}>{r.estado}</span></div>
                        <div className="flex gap-2">
                          <select value={r.estado} onChange={(e) => cambiarEstadoReserva(r.id, e.target.value as EstadoReserva)} className="flex-1 h-8 px-2 rounded-lg border text-xs"><option value="pendiente">pendiente</option><option value="confirmada">confirmada</option><option value="sentada">sentada</option><option value="cancelada">cancelada</option></select>
                          <button onClick={async () => { if (!confirm("¿Borrar reserva?")) return; try { await deleteReserva(r.id); } catch {} setReservas((p) => p.filter((x) => x.id !== r.id)); }} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs">Borrar</button>
                        </div>
                      </div>
                    ))}
                    {!reservas.length && <div className="col-span-3 text-center py-8 text-slate-400">Sin reservas — crea una en /reserva</div>}
                  </div>
                </div>
              )}

              {/* RESENAS */}
              {tab === "resenas" && (
                <div className="p-6">
                  <h3 className="font-bold text-ink text-lg">Reseñas — cliente deja ★★★★★ después de pedir</h3><p className="text-sm text-slate-500 mb-4">C/R desde cliente · R/U/D modera pendiente → aprobada + borra spam</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {resenas.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-3">
                        <div className="flex justify-between"><span className="font-bold text-ink">{r.nombre}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.estado === "aprobada" ? "bg-emerald-50 text-emerald-700" : r.estado === "pendiente" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>{r.estado}</span></div>
                        <div className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.platoId}</div>
                        <div className="text-sm text-slate-600">{r.comentario}</div>
                        <div className="flex gap-2"><button onClick={() => moderar(r.id, "aprobada")} className="flex-1 h-8 bg-emerald-600 text-white rounded-lg text-xs font-semibold">Aprobar</button><button onClick={() => moderar(r.id, "rechazada")} className="h-8 px-3 bg-amber-100 rounded-lg text-xs">Rechazar</button><button onClick={async () => { if (!confirm("¿Borrar reseña?")) return; try { await deleteResena(r.id); } catch {} setResenas((p) => p.filter((x) => x.id !== r.id)); }} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs">Borrar</button></div>
                      </div>
                    ))}
                    {!resenas.length && <div className="col-span-3 text-center py-8 text-slate-400">Sin reseñas — cliente puede dejar una en /resenas</div>}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
