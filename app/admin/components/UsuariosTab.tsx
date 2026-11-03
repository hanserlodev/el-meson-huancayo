"use client";

import { useEffect, useMemo, useState } from "react";
import { cambiarRol, listarUsuarios, type UsuarioDoc } from "@/lib/services/usuarios.service";
import type { PedidoDoc } from "@/lib/services/pedidos.service";

interface Props {
  pedidos: PedidoDoc[];
  emailActual?: string | null;
}

export default function UsuariosTab({ pedidos, emailActual }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;
    listarUsuarios()
      .then((rows) => {
        if (activo) setUsuarios(rows);
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar la lista de usuarios.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const mapa = new Map<string, { pedidos: number; total: number }>();
    for (const p of pedidos) {
      if (!p.uid) continue;
      const actual = mapa.get(p.uid) ?? { pedidos: 0, total: 0 };
      mapa.set(p.uid, { pedidos: actual.pedidos + 1, total: actual.total + Number(p.total || 0) });
    }
    return mapa;
  }, [pedidos]);

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    return !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const cambiar = async (u: UsuarioDoc, rol: "cliente" | "admin") => {
    if (u.email === emailActual && rol === "cliente") {
      setError("No puedes quitarte el rol de administrador a ti mismo.");
      return;
    }
    const accion = rol === "admin" ? "dar acceso de administrador" : "quitar el acceso de administrador";
    if (!confirm(`¿Quieres ${accion} a ${u.nombre}?`)) return;
    try {
      await cambiarRol(u.id, rol);
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, rol } : x)));
      setError(null);
    } catch {
      setError("No se pudo cambiar el rol. Verifica las reglas de Firestore.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h3 className="font-bold text-ink text-lg">Usuarios y roles</h3>
          <p className="text-sm text-slate-500">
            Los usuarios con rol <b>admin</b> pueden entrar a este panel. {usuarios.length} cuentas registradas.
          </p>
        </div>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="h-10 px-3 rounded-lg border text-sm w-full sm:w-72"
        />
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Cargando usuarios…</div>
      ) : filtrados.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          Aún no hay clientes registrados. Se crean al usar &quot;Crear cuenta&quot; en /cuenta.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtrados.map((u) => {
            const stats = resumen.get(u.id) ?? { pedidos: 0, total: 0 };
            const esYo = u.email === emailActual;
            return (
              <article key={u.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-ink truncate">
                      {u.nombre} {esYo && <span className="text-xs font-normal text-slate-400">(tú)</span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    <div className="text-xs text-slate-500">{u.telefono || "Sin teléfono"}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                      u.rol === "admin" ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {u.rol}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-slate-600">
                  <span>
                    <b className="text-ink">{stats.pedidos}</b> pedidos
                  </span>
                  <span>
                    <b className="text-ink">S/ {stats.total.toFixed(2)}</b> gastados
                  </span>
                  <span>
                    <b className="text-ink">{u.direcciones?.length ?? 0}</b> direcciones
                  </span>
                </div>

                <div className="flex gap-2">
                  {u.rol === "admin" ? (
                    <button
                      onClick={() => cambiar(u, "cliente")}
                      disabled={esYo}
                      className="h-8 px-3 bg-white border rounded-lg text-xs font-semibold disabled:opacity-40"
                    >
                      Quitar admin
                    </button>
                  ) : (
                    <button
                      onClick={() => cambiar(u, "admin")}
                      className="h-8 px-3 bg-ink text-white rounded-lg text-xs font-semibold"
                    >
                      Hacer admin
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
