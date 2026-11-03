"use client";

import { useEffect, useState } from "react";
import {
  actualizarCupon,
  borrarCupon,
  crearCupon,
  suscribirCupones,
  type CuponDoc,
} from "@/lib/services/cupones.service";
import type { CuponInput } from "@/lib/schemas/cupon.schema";

const FORM_VACIO = {
  codigo: "",
  tipo: "porcentaje" as CuponInput["tipo"],
  valor: "",
  minimo: "",
  expira: "",
  activo: true,
};

export default function CuponesTab() {
  const [cupones, setCupones] = useState<CuponDoc[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = suscribirCupones(setCupones, () => setCupones([]));
    return () => unsub();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = Number(form.valor);
    const minimo = Number(form.minimo || 0);
    if (!form.codigo.trim() || !Number.isFinite(valor) || valor <= 0) {
      setError("Completa el código y un valor mayor a 0.");
      return;
    }
    const data: CuponInput = {
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor,
      minimo: Number.isFinite(minimo) ? minimo : 0,
      activo: form.activo,
      expira: form.expira || undefined,
    };
    try {
      if (editId) await actualizarCupon(editId, data);
      else await crearCupon(data);
      setShowForm(false);
      setEditId(null);
      setForm(FORM_VACIO);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el cupón.");
    }
  };

  const editar = (c: CuponDoc) => {
    setEditId(c.id);
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: String(c.valor),
      minimo: String(c.minimo ?? 0),
      expira: c.expira ?? "",
      activo: c.activo,
    });
    setShowForm(true);
    setError(null);
  };

  const toggle = async (c: CuponDoc) => {
    try {
      await actualizarCupon(c.id, { activo: !c.activo });
    } catch {
      setError("No se pudo actualizar el cupón.");
    }
  };

  const eliminar = async (c: CuponDoc) => {
    if (!confirm(`¿Eliminar el cupón ${c.codigo}?`)) return;
    try {
      await borrarCupon(c.id);
    } catch {
      setError("No se pudo eliminar el cupón.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 gap-3">
        <div>
          <h3 className="font-bold text-ink text-lg">Cupones de descuento</h3>
          <p className="text-sm text-slate-500">
            Se validan en /carrito y se descuentan del total del pedido.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setEditId(null);
            setForm(FORM_VACIO);
            setError(null);
          }}
          className="h-11 px-5 rounded-lg bg-brand-600 text-white font-semibold flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nuevo cupón
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="mb-6 p-6 rounded-xl bg-slate-50 grid md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Código *</label>
            <input
              required
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              placeholder="MESON10"
              className="h-11 px-3 bg-white rounded-lg border text-sm font-mono uppercase"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as CuponInput["tipo"] })}
              className="h-11 px-3 bg-white rounded-lg border text-sm"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto fijo (S/)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Valor *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder={form.tipo === "porcentaje" ? "10" : "15"}
              className="h-11 px-3 bg-white rounded-lg border text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Compra mínima S/</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.minimo}
              onChange={(e) => setForm({ ...form, minimo: e.target.value })}
              placeholder="0"
              className="h-11 px-3 bg-white rounded-lg border text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Vence (opcional)</label>
            <input
              type="date"
              value={form.expira}
              onChange={(e) => setForm({ ...form, expira: e.target.value })}
              className="h-11 px-3 bg-white rounded-lg border text-sm"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Activo
            </label>
            <button type="submit" className="ml-auto h-11 px-5 bg-ink text-white rounded-lg font-semibold">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-11 px-4 bg-white border rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cupones.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-ink">{c.codigo}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  c.activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}
              >
                {c.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              <div className="font-bold text-brand-600">
                {c.tipo === "porcentaje" ? `${c.valor}% de descuento` : `S/ ${Number(c.valor).toFixed(2)} de descuento`}
              </div>
              <div className="text-xs text-slate-500">
                Mínimo S/ {Number(c.minimo || 0).toFixed(2)}
                {c.expira ? ` · vence ${c.expira}` : " · sin vencimiento"}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editar(c)} className="flex-1 h-8 bg-white border rounded-lg text-xs font-semibold">
                Editar
              </button>
              <button onClick={() => toggle(c)} className="h-8 px-3 bg-slate-900 text-white rounded-lg text-xs">
                {c.activo ? "Desactivar" : "Activar"}
              </button>
              <button onClick={() => eliminar(c)} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs">
                Borrar
              </button>
            </div>
          </div>
        ))}
        {!cupones.length && (
          <div className="col-span-full text-center py-8 text-slate-400">
            Sin cupones — crea uno como MESON10.
          </div>
        )}
      </div>
    </div>
  );
}
