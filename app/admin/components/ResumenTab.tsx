"use client";

import { useMemo } from "react";
import type { PedidoDoc, EstadoPedido } from "@/lib/services/pedidos.service";
import type { ReservaDoc } from "@/lib/services/reservas.service";
import type { ResenaDoc } from "@/lib/services/resenas.service";

interface Props {
  pedidos: PedidoDoc[];
  reservas: ReservaDoc[];
  resenas: ResenaDoc[];
}

const ESTADOS: Record<EstadoPedido, { label: string; clase: string }> = {
  pendiente: { label: "Recibido", clase: "bg-amber-100 text-amber-800" },
  enHorno: { label: "En horno", clase: "bg-orange-100 text-orange-800" },
  enCamino: { label: "En camino", clase: "bg-sky-100 text-sky-800" },
  entregado: { label: "Entregado", clase: "bg-emerald-100 text-emerald-800" },
  cancelado: { label: "Cancelado", clase: "bg-red-100 text-red-800" },
};

function fechaMs(valor: unknown): number {
  if (!valor) return 0;
  if (typeof valor === "string") return Date.parse(valor) || 0;
  if (typeof valor === "object" && valor !== null && "toMillis" in valor) {
    return (valor as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function soles(n: number): string {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ResumenTab({ pedidos, reservas, resenas }: Props) {
  const datos = useMemo(() => {
    const validos = pedidos.filter((p) => p.estado !== "cancelado");
    const ahora = new Date();
    const mismoDia = (d: Date) =>
      d.getFullYear() === ahora.getFullYear() &&
      d.getMonth() === ahora.getMonth() &&
      d.getDate() === ahora.getDate();

    let ventasHoy = 0;
    let ventasMes = 0;
    const porDia = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(ahora);
      d.setDate(ahora.getDate() - i);
      porDia.set(d.toISOString().slice(0, 10), 0);
    }

    for (const p of validos) {
      const ms = fechaMs(p.createdAt);
      if (!ms) continue;
      const fecha = new Date(ms);
      if (mismoDia(fecha)) ventasHoy += Number(p.total || 0);
      if (fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()) {
        ventasMes += Number(p.total || 0);
      }
      const clave = fecha.toISOString().slice(0, 10);
      if (porDia.has(clave)) porDia.set(clave, (porDia.get(clave) ?? 0) + Number(p.total || 0));
    }

    const ticket = validos.length
      ? validos.reduce((a, p) => a + Number(p.total || 0), 0) / validos.length
      : 0;

    const platos = new Map<string, { cant: number; total: number }>();
    for (const p of validos) {
      for (const it of p.items ?? []) {
        const actual = platos.get(it.nombre) ?? { cant: 0, total: 0 };
        platos.set(it.nombre, {
          cant: actual.cant + it.cant,
          total: actual.total + it.cant * it.precio,
        });
      }
    }
    const topPlatos = [...platos.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.cant - a.cant)
      .slice(0, 5);

    const recientes = [...pedidos]
      .sort((a, b) => fechaMs(b.createdAt) - fechaMs(a.createdAt))
      .slice(0, 5);

    const dias = [...porDia.entries()].map(([fecha, total]) => ({
      fecha,
      total,
      label: new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "short" }),
    }));

    return {
      ventasHoy,
      ventasMes,
      ticket,
      activos: pedidos.filter((p) => p.estado === "pendiente" || p.estado === "enHorno" || p.estado === "enCamino").length,
      reservasPendientes: reservas.filter((r) => r.estado === "pendiente" || r.estado === "confirmada").length,
      resenasPendientes: resenas.filter((r) => r.estado === "pendiente").length,
      topPlatos,
      recientes,
      dias,
    };
  }, [pedidos, reservas, resenas]);

  const maxDia = Math.max(1, ...datos.dias.map((d) => d.total));

  return (
    <div className="p-6">
      <h3 className="font-bold text-ink text-lg">Resumen del negocio</h3>
      <p className="text-sm text-slate-500 mb-6">Datos en vivo de pedidos, reservas y reseñas.</p>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ventas hoy", valor: `S/ ${soles(datos.ventasHoy)}`, icon: "sell" },
          { label: "Ventas del mes", valor: `S/ ${soles(datos.ventasMes)}`, icon: "analytics" },
          { label: "Ticket promedio", valor: `S/ ${soles(datos.ticket)}`, icon: "receipt_long" },
          { label: "Pedidos activos", valor: String(datos.activos), icon: "local_fire_department" },
        ].map((k) => (
          <div key={k.label} className="bg-slate-50 border rounded-xl p-4 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">{k.label}</div>
              <div className="text-xl font-bold text-ink mt-1">{k.valor}</div>
            </div>
            <span className="material-symbols-outlined text-2xl text-brand-600">{k.icon}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="border rounded-xl p-4">
          <h4 className="font-bold text-ink mb-4">Ventas últimos 7 días</h4>
          {datos.dias.every((d) => d.total === 0) ? (
            <div className="h-40 grid place-items-center text-sm text-slate-400">
              Sin ventas en los últimos 7 días.
            </div>
          ) : (
          <div className="flex items-end gap-2 h-40">
            {datos.dias.map((d) => (
              <div key={d.fecha} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-[10px] text-slate-500">{d.total > 0 ? `S/${Math.round(d.total)}` : ""}</div>
                <div
                  className={`w-full rounded-t-lg ${d.total > 0 ? "bg-brand-600" : "bg-slate-200"}`}
                  style={{ height: `${Math.max(4, (d.total / maxDia) * 120)}px` }}
                  title={`${d.fecha}: S/ ${soles(d.total)}`}
                />
                <div className="text-[11px] text-slate-500 capitalize">{d.label}</div>
              </div>
            ))}
          </div>
          )}
        </section>

        <section className="border rounded-xl p-4">
          <h4 className="font-bold text-ink mb-4">Platos más vendidos</h4>
          {datos.topPlatos.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Aún no hay ventas registradas.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {datos.topPlatos.map((p, i) => (
                <li key={p.nombre} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold grid place-items-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{p.nombre}</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{ width: `${(p.cant / datos.topPlatos[0].cant) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">{p.cant} uds</div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Reservas por atender</div>
          <div className="text-2xl font-bold text-ink mt-1">{datos.reservasPendientes}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Reseñas por moderar</div>
          <div className="text-2xl font-bold text-ink mt-1">{datos.resenasPendientes}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Pedidos totales</div>
          <div className="text-2xl font-bold text-ink mt-1">{pedidos.length}</div>
        </div>
      </div>

      <section className="border rounded-xl p-4 mt-6">
        <h4 className="font-bold text-ink mb-4">Últimos pedidos</h4>
        {datos.recientes.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Sin pedidos todavía.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {datos.recientes.map((p) => {
              const estado = ESTADOS[p.estado] ?? ESTADOS.pendiente;
              const ms = fechaMs(p.createdAt);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-bold text-ink">{p.codigo ?? p.id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {p.cliente?.nombre || "Cliente"} ·{" "}
                      {ms ? new Date(ms).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm text-ink">S/ {Number(p.total || 0).toFixed(2)}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${estado.clase}`}>{estado.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
