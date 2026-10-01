"use client";
import Image from "next/image";
import type { Plato } from "@/lib/data";

type Stock = "Activo" | "Bajo" | "Agotado";
interface AdminPlato extends Plato { activo: boolean; stock: Stock; }

interface Props {
  filtered: AdminPlato[];
  search: string;
  catFilter: string;
  showForm: boolean;
  editingId: string | null;
  form: { nombre: string; cat: string; precio: string; stock: Stock; desc: string };
  setSearch: (v: string) => void;
  setCatFilter: (v: string) => void;
  setShowForm: (v: boolean) => void;
  setEditingId: (v: string | null) => void;
  setForm: (v: Props["form"]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  editDish: (p: AdminPlato) => void;
  delDish: (id: string) => void;
  toggleStock: (id: string) => void;
}

/**
 * Tab Platos — tabla + filtros + formulario CRUD.
 * Extraído de AdminPage para reducir complejidad ciclomática (<10).
 */
export default function PlatosTab({ filtered, search, catFilter, showForm, form, setSearch, setCatFilter, setShowForm, setEditingId, setForm, handleSubmit, editDish, delDish, toggleStock }: Props) {
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar plato..." className="w-full h-11 pl-10 pr-4 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {["todas", "Brasas", "Parrillas", "Bebidas"].map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${catFilter === c ? "bg-white shadow text-ink" : "text-slate-500"}`}>{c === "todas" ? "Todas" : c}</button>
            ))}
          </div>
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
        <table className="w-full text-left text-sm">
          <thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><th className="py-3 px-4">Plato</th><th className="py-3 px-4">Cat</th><th className="py-3 px-4">Precio</th><th className="py-3 px-4">Estado</th><th className="py-3 px-4 text-right">Acciones</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 border-t">
                <td className="py-3.5 px-4"><div className="flex items-center gap-3"><Image src={p.img} alt={p.nombre} width={48} height={48} className="w-12 h-12 rounded-lg object-cover bg-slate-100" /><div><div className="font-semibold text-ink">{p.nombre}</div><div className="text-xs text-slate-500 truncate max-w-[220px]">{p.desc}</div></div></div></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100">{p.cat}</span></td>
                <td className="py-3.5 px-4 font-bold">S/ {p.precio.toFixed(2)}</td>
                <td className="py-3.5 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock === "Activo" ? "bg-emerald-50 text-emerald-700" : p.stock === "Bajo" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>{p.stock}</span></td>
                <td className="py-3.5 px-4 text-right"><div className="inline-flex gap-1.5"><button onClick={() => editDish(p)} className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center" aria-label="Editar"><span className="material-symbols-outlined text-[16px]">edit</span></button><button onClick={() => toggleStock(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center" aria-label="Toggle stock"><span className="material-symbols-outlined text-[16px]">sync_alt</span></button><button onClick={() => delDish(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center" aria-label="Eliminar"><span className="material-symbols-outlined text-[16px]">delete</span></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
