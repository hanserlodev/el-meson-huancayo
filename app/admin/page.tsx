"use client";

import { useEffect, useState } from "react";
import { PLATOS as PLATOS_INIT, type Plato } from "@/lib/data";
import { createPlato, deletePlato, subscribePlatos, updatePlato } from "@/lib/services/platos.service";

type Tab = "menu" | "reservas" | "delivery";
type Stock = "Activo" | "Bajo" | "Agotado";

interface AdminPlato extends Plato {
  activo: boolean;
  stock: Stock;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("menu");
  const [platos, setPlatos] = useState<AdminPlato[]>(
    PLATOS_INIT.map((p) => ({ ...p, activo: true, stock: "Activo" as Stock }))
  );
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cat: "Brasas", precio: "", stock: "Activo" as Stock, desc: "" });

  // Subscribe to Firestore (fallback to local if not configured)
  useEffect(() => {
    const unsub = subscribePlatos((data) => {
      if (data.length) setPlatos(data.map((p) => ({ ...p, activo: true, stock: "Activo" } as AdminPlato)));
    });
    return () => unsub();
  }, []);

  const filtered = platos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "todas" || p.cat.toLowerCase() === catFilter.toLowerCase() || (catFilter === "Brasas" && p.cat === "brasa") || (catFilter === "Parrillas" && p.cat === "parrilla") || (catFilter === "Bebidas" && p.cat === "extra");
    return matchSearch && matchCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio);
    if (!form.nombre || isNaN(precio) || precio <= 0) return;
    const catMap: Record<string, Plato["cat"]> = { Brasas: "brasa", Parrillas: "parrilla", Bebidas: "extra", Guarniciones: "extra" };
    const cat = catMap[form.cat] || "brasa";
    if (editingId) {
      const updated: Partial<Plato> = { nombre: form.nombre, precio, cat, desc: form.desc, tag: form.stock === "Agotado" ? "Agotado" : "" };
      try {
        await updatePlato(editingId, updated);
      } catch {}
      setPlatos((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated, stock: form.stock, activo: form.stock !== "Agotado" } as AdminPlato : p)));
    } else {
      const newPlato: Plato = {
        id: `plato-${Date.now()}`,
        nombre: form.nombre,
        precio,
        cat,
        desc: form.desc || "Receta especial de la casa",
        img: "/imagenes/cuarto-brasa.png",
        tag: form.stock === "Agotado" ? "Agotado" : "",
        rating: "★★★★★",
        votos: 0,
        activo: form.stock !== "Agotado",
      };
      try {
        await createPlato(newPlato);
      } catch {}
      setPlatos((prev) => [{ ...newPlato, stock: form.stock } as AdminPlato, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nombre: "", cat: "Brasas", precio: "", stock: "Activo", desc: "" });
  };

  const editDish = (p: AdminPlato) => {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, cat: p.cat === "brasa" ? "Brasas" : p.cat === "parrilla" ? "Parrillas" : "Bebidas", precio: String(p.precio), stock: p.stock, desc: p.desc });
    setShowForm(true);
  };

  const delDish = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este plato de la carta de El Mesón?")) return;
    try {
      await deletePlato(id);
    } catch {}
    setPlatos((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleStock = (id: string) => {
    setPlatos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next: Stock = p.stock === "Activo" ? "Agotado" : p.stock === "Agotado" ? "Bajo" : "Activo";
        return { ...p, stock: next, activo: next !== "Agotado" };
      })
    );
  };

  return (
    <div className="min-h-screen bg-bg-canvas">
      {/* Sidebar + Main */}
      <div className="flex">
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-on-background text-surface flex-col justify-between shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] z-40">
          <div className="flex flex-col">
            <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-surface">El Mesón</span>
                <span className="text-xs text-primary-fixed uppercase tracking-wider">Panel de Control</span>
              </div>
            </div>
            <div className="p-4">
              <p className="px-3 mb-2 text-xs uppercase tracking-wider text-white/50">Gestión Operativa</p>
              <nav className="flex flex-col gap-1">
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-on-primary font-semibold">
                  <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>Gestión Platos / CRUD
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>Pedidos Delivery
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
                  <span className="material-symbols-outlined text-[20px]">event_seat</span>Control Reservas
                </a>
              </nav>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <a href="/" className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm">
              <span className="material-symbols-outlined text-[18px]">storefront</span>Volver a la Tienda
            </a>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 z-30 flex items-center justify-between px-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Sede Activa: Giráldez 157
            </span>
            <span className="text-sm text-slate-500">Central: 939 399 946</span>
          </header>

          <main className="px-6 py-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500">Platos en Carta</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-ink">{platos.length}</span>
                    <span className="text-xs text-emerald-600 font-semibold">100% disponibles</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-3xl text-brand-600">restaurant_menu</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500">Delivery Hoy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-ink">48</span>
                    <span className="text-xs text-orange-600 font-bold">+18% vs ayer</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-3xl text-brand-600">moped</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500">Mesas Reservadas</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-ink">16</span>
                    <span className="text-xs text-amber-600 font-bold">Turno Noche</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-3xl text-amber-600">table_restaurant</span>
              </div>
              <div className="bg-ink text-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-300">Horno a la Brasa</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">220°C</span>
                    <span className="text-xs text-amber-300">Operativo</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-3xl text-amber-300">local_fire_department</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="flex flex-wrap items-center gap-2 p-6 border-b">
                <button onClick={() => setTab("menu")} className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 ${tab === "menu" ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}>
                  <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>Catálogo de Carta & Platos
                </button>
                <button onClick={() => setTab("reservas")} className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 ${tab === "reservas" ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}>
                  <span className="material-symbols-outlined text-[18px]">event_seat</span>Reservas del Día (16)
                </button>
                <button onClick={() => setTab("delivery")} className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 ${tab === "delivery" ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}>
                  <span className="material-symbols-outlined text-[18px]">chat</span>Comandas WhatsApp (8)
                </button>
              </div>

              {tab === "menu" && (
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative min-w-[260px] flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre de plato o insumo..." className="w-full h-11 pl-10 pr-4 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        {["todas", "Brasas", "Parrillas", "Bebidas"].map((c) => (
                          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${catFilter === c ? "bg-white shadow text-ink" : "text-slate-500"}`}>
                            {c === "todas" ? "Todas" : c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nombre: "", cat: "Brasas", precio: "", stock: "Activo", desc: "" }); }} className="h-11 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">add</span>+ Nuevo Plato / Crear (Create)
                    </button>
                  </div>

                  {showForm && (
                    <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Nombre del Plato *</label>
                        <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: 1/4 Pollo a la Brasa Tradicional" className="h-11 px-3.5 bg-white rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-600" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Categoría *</label>
                        <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="h-11 px-3 bg-white rounded-lg text-sm border">
                          <option>Brasas</option><option>Parrillas</option><option>Bebidas</option><option>Guarniciones</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Precio (S/.) *</label>
                        <input required type="number" step="0.1" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="10.90" className="h-11 px-3 bg-white rounded-lg text-sm border" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Disponibilidad</label>
                        <select value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value as Stock })} className="h-11 px-3 bg-white rounded-lg text-sm border">
                          <option>Activo</option><option>Bajo</option><option>Agotado</option>
                        </select>
                      </div>
                      <div className="lg:col-span-3 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Descripción</label>
                        <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Incluye papas nativas fritas crocantes, ensalada clásica y ají de la casa." className="h-11 px-3.5 bg-white rounded-lg text-sm border" />
                      </div>
                      <div className="flex items-end gap-2">
                        <button type="submit" className="w-full h-11 bg-ink text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">save</span>Guardar Cambios
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="h-11 px-4 bg-white border rounded-lg">Cancelar</button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Plato & Detalle</th><th className="py-3 px-4">Categoría</th><th className="py-3 px-4">Precio (S/.)</th><th className="py-3 px-4">Estado Stock</th><th className="py-3 px-4 text-right">Acciones CRUD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 border-t">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img src={p.img} alt={p.nombre} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                <div>
                                  <div className="font-semibold text-ink">{p.nombre}</div>
                                  <div className="text-xs text-slate-500 truncate max-w-[220px]">{p.desc}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100">{p.cat}</span></td>
                            <td className="py-3.5 px-4 font-bold text-ink">S/ {p.precio.toFixed(2)}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock === "Activo" ? "bg-emerald-50 text-emerald-700" : p.stock === "Bajo" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                                <span className={`w-2 h-2 rounded-full ${p.stock === "Activo" ? "bg-emerald-500" : p.stock === "Bajo" ? "bg-amber-500" : "bg-red-500"}`}></span>{p.stock}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button onClick={() => editDish(p)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 grid place-items-center"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                                <button onClick={() => toggleStock(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 grid place-items-center"><span className="material-symbols-outlined text-[16px]">sync_alt</span></button>
                                <button onClick={() => delDish(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 grid place-items-center"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between pt-4 text-sm text-slate-500">
                    <span>Mostrando {filtered.length} de {platos.length} platos</span>
                    <span className="text-xs">Firestore: {platos.length > 9 ? "conectado" : "local (usa .env para Firestore)"}</span>
                  </div>
                </div>
              )}

              {tab === "reservas" && (
                <div className="p-6">
                  <h3 className="font-bold text-ink text-lg">Control de Reservas de Salón</h3>
                  <p className="text-sm text-slate-500 mb-4">Sede Giráldez 157 • 16 reservas — demo con datos mock (conecta lib/services/reservas.service.ts para Firestore)</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { nombre: "Carlos Palacios", tel: "954 112 880 • 4 Personas", hora: "01:30 PM • Mesa 04", estado: "Confirmada" },
                      { nombre: "María Elena Rojas", tel: "964 887 019 • 8 Personas", hora: "02:15 PM • Zona Familiar", estado: "Pendiente" },
                      { nombre: "Dr. Fernando Gutarra", tel: "945 009 211 • 2 Personas", hora: "Mesa 12 • En Atención", estado: "Sentada" },
                    ].map((r) => (
                      <div key={r.nombre} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-3">
                        <div className="flex justify-between">
                          <div><div className="font-bold text-ink">{r.nombre}</div><div className="text-xs text-slate-500">{r.tel}</div></div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.estado === "Confirmada" ? "bg-emerald-50 text-emerald-700" : r.estado === "Pendiente" ? "bg-amber-50 text-amber-700" : "bg-slate-200"}`}>{r.estado}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 text-sm">
                          <span>{r.hora}</span><button className="px-2.5 py-1 rounded bg-ink text-white text-xs">Ver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "delivery" && (
                <div className="p-6">
                  <h3 className="font-bold text-ink text-lg">Comandas WhatsApp & Central Delivery</h3>
                  <p className="text-sm text-slate-500 mb-4">8 En Cocina / Despacho — 939 399 946</p>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { id: "#ORD-9024", plato: "1x Pollo Entero a la Brasa", total: "S/ 43.60", estado: "En Horno" },
                      { id: "#ORD-9025", plato: "2x 1/4 Pollo + 1L Chicha", total: "S/ 30.80", estado: "En Camino" },
                      { id: "#ORD-9026", plato: "1x Anticuchos de Corazón", total: "S/ 21.90", estado: "Despachado" },
                      { id: "#ORD-9027", plato: "1x Combo Familiar Martes", total: "S/ 46.90", estado: "Nuevo" },
                    ].map((o) => (
                      <div key={o.id} className="p-4 rounded-xl bg-slate-50 border flex flex-col gap-3">
                        <div className="flex justify-between"><span className="font-bold text-brand-600">{o.id}</span><span className="text-xs text-slate-500">Hace 6 min</span></div>
                        <div><div className="font-semibold text-ink text-sm">{o.plato}</div><div className="font-bold text-ink">{o.total}</div></div>
                        <span className="px-2 py-1 rounded bg-ink text-white text-xs font-bold w-fit">{o.estado}</span>
                      </div>
                    ))}
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
