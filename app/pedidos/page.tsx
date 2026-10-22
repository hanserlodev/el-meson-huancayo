"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  buscarPedido,
  normalizarCodigo,
  subscribePedido,
  type EstadoPedido,
  type SeguimientoDoc,
} from "@/lib/services/pedidos.service";
import { CODIGO_PEDIDO_RE } from "@/lib/schemas/pedido.schema";
import {
  guardarCodigo,
  misPedidosServerSnapshot,
  misPedidosSnapshot,
  quitarCodigo,
  suscribirMisPedidos,
} from "@/lib/stores/misPedidos";
import { WHATSAPP } from "@/lib/data";

const PASOS: { id: EstadoPedido; label: string; icon: string }[] = [
  { id: "pendiente", label: "Recibido", icon: "receipt_long" },
  { id: "enHorno", label: "En el horno", icon: "local_fire_department" },
  { id: "enCamino", label: "En camino", icon: "moped" },
  { id: "entregado", label: "Entregado", icon: "check_circle" },
];

function formatoFecha(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MisPedidosPage() {
  const guardados = useSyncExternalStore(
    suscribirMisPedidos,
    misPedidosSnapshot,
    misPedidosServerSnapshot
  );
  const [seguimientos, setSeguimientos] = useState<
    Record<string, SeguimientoDoc | null | undefined>
  >({});
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [msg, setMsg] = useState<{ texto: string; ok: boolean } | null>(null);

  // Escucha en vivo el estado de cada pedido guardado.
  useEffect(() => {
    if (!guardados.length) return;
    const unsubs = guardados.map((g) =>
      subscribePedido(
        g.codigo,
        (row) => setSeguimientos((s) => ({ ...s, [g.codigo]: row })),
        () =>
          setSeguimientos((s) =>
            s[g.codigo] === undefined ? { ...s, [g.codigo]: null } : s
          )
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [guardados]);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buscando) return;

    const normalizado = normalizarCodigo(codigo);
    if (!CODIGO_PEDIDO_RE.test(normalizado)) {
      setMsg({ texto: "El código debe tener el formato MES-XXXXXX.", ok: false });
      return;
    }

    setBuscando(true);
    setMsg(null);
    try {
      const row = await buscarPedido(normalizado);
      if (!row) {
        setMsg({ texto: "No encontramos ese pedido. Verifica el código.", ok: false });
        return;
      }
      guardarCodigo(normalizado);
      setSeguimientos((s) => ({ ...s, [normalizado]: row }));
      setCodigo("");
      setMsg({ texto: `Pedido ${normalizado} agregado a tu lista.`, ok: true });
    } catch {
      setMsg({ texto: "No se pudo consultar el pedido. Intenta de nuevo.", ok: false });
    } finally {
      setBuscando(false);
    }
  };

  const quitar = (code: string) => {
    quitarCodigo(code);
    setSeguimientos((s) => {
      const copia = { ...s };
      delete copia[code];
      return copia;
    });
  };

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />

      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">delivery_dining</span>
            Seguimiento en vivo
          </span>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-ink mt-3">
            Mis pedidos <span className="text-brand-600">·</span> del horno a tu mesa
          </h1>
          <p className="text-slate-600 max-w-2xl mt-2">
            Consulta el estado de tus pedidos con tu código. Se actualiza automáticamente cuando
            la cocina avanza tu comanda.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* BUSCADOR */}
        <form
          onSubmit={buscar}
          className="bg-white p-5 sm:p-6 rounded-2xl ring-1 ring-slate-900/5 shadow-sm flex flex-col gap-3"
        >
          <label htmlFor="codigo-pedido" className="text-xs font-semibold text-slate-600">
            ¿Tienes un código de pedido?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                id="codigo-pedido"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="MES-7K3P9A"
                maxLength={12}
                autoComplete="off"
                spellCheck={false}
                className="w-full h-12 pl-11 pr-3 bg-slate-100 rounded-xl text-sm font-mono tracking-wider text-ink uppercase focus:outline-none focus:bg-white ring-1 ring-transparent focus:ring-brand-600"
              />
            </div>
            <button
              type="submit"
              disabled={buscando}
              className="h-12 px-6 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {buscando ? "Buscando..." : "Buscar pedido"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Tus códigos se guardan solo en este navegador. Si cambias de equipo, pega el código
            que te dimos al confirmar.
          </p>
          {msg && (
            <div
              className={`text-sm p-3 rounded-lg ${
                msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {msg.texto}
            </div>
          )}
        </form>

        {/* LISTA */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink text-lg">Tus pedidos</h2>
            {guardados.length > 0 && (
              <span className="text-sm text-slate-500">
                {guardados.length} {guardados.length === 1 ? "pedido" : "pedidos"}
              </span>
            )}
          </div>

          {guardados.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-slate-200 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
              <p className="font-bold text-ink">Todavía no tienes pedidos guardados</p>
              <p className="text-sm text-slate-500 max-w-md">
                Haz tu primer pedido y te daremos un código para seguirlo en tiempo real.
              </p>
              <Link
                href="/carta"
                className="mt-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
              >
                Explorar la carta
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {guardados.map((g) => {
                const pedido = seguimientos[g.codigo];
                const idx = pedido ? PASOS.findIndex((p) => p.id === pedido.estado) : -1;

                return (
                  <article
                    key={g.codigo}
                    className="bg-white rounded-2xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden"
                  >
                    <div className="p-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-brand-600 text-[20px]">
                            receipt_long
                          </span>
                          <h3 className="font-mono font-bold text-ink tracking-wider text-lg">
                            {g.codigo}
                          </h3>
                        </div>
                        {pedido?.fecha ? (
                          <p className="text-xs text-slate-500 mt-1">{formatoFecha(pedido.fecha)}</p>
                        ) : g.fecha ? (
                          <p className="text-xs text-slate-500 mt-1">
                            Agregado el {formatoFecha(g.fecha)}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        {pedido && (
                          <>
                            <div className="font-bold text-ink">
                              S/ {Number(pedido.total || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {pedido.modo === "pickup" ? "Recojo en tienda" : "Delivery"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-5">
                      {pedido === undefined ? (
                        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                      ) : pedido === null ? (
                        <div className="p-3 rounded-xl bg-slate-50 text-sm text-slate-500">
                          No encontramos este pedido. Puede haber sido eliminado o el código no
                          está disponible.
                        </div>
                      ) : (
                        <>
                          {pedido.estado === "cancelado" ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold">
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                              Pedido cancelado
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-1">
                              {PASOS.map((paso, i) => {
                                const hecho = i <= idx;
                                const entregadoPaso =
                                  pedido.estado === "entregado" && i === PASOS.length - 1;
                                return (
                                  <div
                                    key={paso.id}
                                    className="flex flex-col items-center gap-1 text-center"
                                  >
                                    <div className="relative">
                                      {entregadoPaso && (
                                        <span
                                          className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping"
                                          aria-hidden="true"
                                        />
                                      )}
                                      <div
                                        className={`relative w-9 h-9 rounded-full grid place-items-center transition-colors ${
                                          hecho
                                            ? "bg-brand-600 text-white"
                                            : "bg-slate-100 text-slate-400"
                                        } ${entregadoPaso ? "animate-entrega" : ""}`}
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          {paso.icon}
                                        </span>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                                        entregadoPaso
                                          ? "text-brand-700"
                                          : hecho
                                            ? "text-ink"
                                            : "text-slate-400"
                                      }`}
                                    >
                                      {paso.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {pedido.estado === "entregado" && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold ring-1 ring-emerald-200 animate-[aparecer_0.4s_ease_both]">
                              <span className="material-symbols-outlined text-[20px] animate-check-pop">
                                check_circle
                              </span>
                              ¡Entregado! Buen provecho.
                            </div>
                          )}

                          <p className="text-sm text-slate-600">
                            {pedido.items?.map((it) => `${it.cant}x ${it.nombre}`).join(" · ") || "—"}
                          </p>
                        </>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href="/carta"
                          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                          Pedir de nuevo
                        </Link>
                        <a
                          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                            `Hola, consulto por mi pedido ${g.codigo}`
                          )}`}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                          Consultar
                        </a>
                        <button
                          onClick={() => quitar(g.codigo)}
                          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Quitar de la lista
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
