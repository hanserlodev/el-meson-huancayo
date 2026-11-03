"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import {
  authErrorMessage,
  changePassword,
  registerUser,
  signInUser,
  signOutUser,
} from "@/lib/firebase/auth";
import {
  actualizarPerfil,
  asegurarPerfil,
  suscribirPerfil,
  type UsuarioDoc,
} from "@/lib/services/usuarios.service";
import type { Direccion } from "@/lib/schemas/usuario.schema";

type Tab = "perfil" | "direcciones" | "seguridad";

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `dir-${Date.now()}`;
}

export default function CuentaPage() {
  const { user, loading } = useAuth();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [perfil, setPerfil] = useState<UsuarioDoc | null>(null);
  const [tab, setTab] = useState<Tab>("perfil");
  const [msg, setMsg] = useState<{ texto: string; ok: boolean } | null>(null);

  // Login / registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreRegistro, setNombreRegistro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Perfil
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Direcciones
  const [dirForm, setDirForm] = useState({ alias: "Casa", direccion: "", referencia: "" });
  const [mostrarDir, setMostrarDir] = useState(false);

  // Seguridad
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passRepetir, setPassRepetir] = useState("");
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    let unsub: (() => void) | undefined;

    asegurarPerfil(user)
      .then((p) => {
        if (cancelado) return;
        setPerfil(p);
        setNombre(p.nombre);
        setTelefono(p.telefono ?? "");
        unsub = suscribirPerfil(user.uid, (doc) => {
          if (!doc) return;
          setPerfil(doc);
          setNombre(doc.nombre);
          setTelefono(doc.telefono ?? "");
        });
      })
      .catch(() => setMsg({ texto: "No se pudo cargar tu perfil.", ok: false }));

    return () => {
      cancelado = true;
      unsub?.();
    };
  }, [user]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setMsg(null);
    setEnviando(true);
    try {
      await signInUser(email.trim(), password);
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg({ texto: authErrorMessage(err), ok: false });
    } finally {
      setEnviando(false);
    }
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (password.length < 6) return setMsg({ texto: "La contraseña debe tener al menos 6 caracteres.", ok: false });
    setMsg(null);
    setEnviando(true);
    try {
      const nuevo = await registerUser(email.trim(), password, nombreRegistro);
      const perfilCreado = await asegurarPerfil(nuevo);
      if (nombreRegistro.trim() && perfilCreado.nombre !== nombreRegistro.trim()) {
        await actualizarPerfil(nuevo.uid, { nombre: nombreRegistro.trim() });
      }
      setEmail("");
      setPassword("");
      setNombreRegistro("");
    } catch (err) {
      setMsg({ texto: authErrorMessage(err), ok: false });
    } finally {
      setEnviando(false);
    }
  };

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || guardandoPerfil) return;
    setMsg(null);
    setGuardandoPerfil(true);
    try {
      await actualizarPerfil(user.uid, { nombre: nombre.trim(), telefono: telefono.trim() });
      setMsg({ texto: "Datos actualizados.", ok: true });
    } catch (err) {
      setMsg({ texto: err instanceof Error ? err.message : "No se pudo guardar.", ok: false });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !perfil) return;
    if (dirForm.direccion.trim().length < 3) return setMsg({ texto: "Ingresa una dirección válida.", ok: false });
    const actuales = perfil.direcciones ?? [];
    if (actuales.length >= 5) return setMsg({ texto: "Puedes guardar hasta 5 direcciones.", ok: false });
    const nueva: Direccion = {
      id: nuevoId(),
      alias: dirForm.alias.trim() || "Casa",
      direccion: dirForm.direccion.trim(),
      referencia: dirForm.referencia.trim(),
      principal: actuales.length === 0,
    };
    try {
      await actualizarPerfil(user.uid, { direcciones: [...actuales, nueva] });
      setDirForm({ alias: "Casa", direccion: "", referencia: "" });
      setMostrarDir(false);
      setMsg({ texto: "Dirección agregada.", ok: true });
    } catch {
      setMsg({ texto: "No se pudo guardar la dirección.", ok: false });
    }
  };

  const marcarPrincipal = async (id: string) => {
    if (!user || !perfil) return;
    const actualizadas = (perfil.direcciones ?? []).map((d) => ({ ...d, principal: d.id === id }));
    try {
      await actualizarPerfil(user.uid, { direcciones: actualizadas });
    } catch {
      setMsg({ texto: "No se pudo actualizar la dirección.", ok: false });
    }
  };

  const borrarDireccion = async (id: string) => {
    if (!user || !perfil) return;
    if (!confirm("¿Eliminar esta dirección?")) return;
    const restantes = (perfil.direcciones ?? []).filter((d) => d.id !== id);
    if (restantes.length && !restantes.some((d) => d.principal)) restantes[0].principal = true;
    try {
      await actualizarPerfil(user.uid, { direcciones: restantes });
    } catch {
      setMsg({ texto: "No se pudo eliminar la dirección.", ok: false });
    }
  };

  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cambiando) return;
    if (passNueva.length < 6) return setMsg({ texto: "La nueva contraseña debe tener al menos 6 caracteres.", ok: false });
    if (passNueva !== passRepetir) return setMsg({ texto: "Las contraseñas no coinciden.", ok: false });
    setMsg(null);
    setCambiando(true);
    try {
      await changePassword(passActual, passNueva);
      setPassActual("");
      setPassNueva("");
      setPassRepetir("");
      setMsg({ texto: "Contraseña actualizada.", ok: true });
    } catch (err) {
      setMsg({ texto: authErrorMessage(err), ok: false });
    } finally {
      setCambiando(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">person</span>
            Mi cuenta
          </span>
          <h1 className="text-3xl font-display font-bold text-ink mt-3">
            {user ? `Hola, ${perfil?.nombre || user.email?.split("@")[0]}` : "Ingresa a El Mesón"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user
              ? "Administra tus datos, direcciones de entrega y contraseña."
              : "Guarda tus datos, revisa tus pedidos y recibe tus direcciones en el checkout."}
          </p>
        </div>

        {!user ? (
          <div className="max-w-md bg-white rounded-2xl shadow-md ring-1 ring-slate-900/5 p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
              <button
                onClick={() => { setModo("login"); setMsg(null); }}
                className={`py-2.5 rounded-md text-sm font-semibold ${modo === "login" ? "bg-white shadow text-ink" : "text-slate-500"}`}
              >
                Ingresar
              </button>
              <button
                onClick={() => { setModo("registro"); setMsg(null); }}
                className={`py-2.5 rounded-md text-sm font-semibold ${modo === "registro" ? "bg-white shadow text-ink" : "text-slate-500"}`}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={modo === "login" ? entrar : registrar} className="flex flex-col gap-4">
              {modo === "registro" && (
                <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                  Nombre y apellido
                  <input
                    required
                    value={nombreRegistro}
                    onChange={(e) => setNombreRegistro(e.target.value)}
                    placeholder="Ej. Ana Quispe"
                    className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </label>
              )}
              <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                Correo
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                Contraseña
                <input
                  type="password"
                  required
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </label>
              {msg && (
                <p className={`text-sm p-3 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {msg.texto}
                </p>
              )}
              <button
                type="submit"
                disabled={enviando || loading}
                className="h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-60"
              >
                {loading ? "Cargando…" : enviando ? "Procesando…" : modo === "login" ? "Iniciar sesión" : "Crear mi cuenta"}
              </button>
              {modo === "login" && (
                <Link href="/cuenta/recuperar" className="text-center text-sm text-brand-600 font-semibold hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </form>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-5 flex flex-col gap-1">
              {([
                { id: "perfil", label: "Datos personales", icon: "person" },
                { id: "direcciones", label: "Direcciones", icon: "location_on" },
                { id: "seguridad", label: "Seguridad", icon: "lock" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setMsg(null); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm ${tab === t.id ? "bg-ink text-white font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <Link href="/pedidos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Mis pedidos
              </Link>
              <hr className="my-2 border-slate-100" />
              <div className="px-3 text-xs text-slate-500 break-all">{user.email}</div>
              <button
                onClick={() => signOutUser()}
                className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Cerrar sesión
              </button>
            </aside>

            <section className="lg:col-span-8 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6">
              {msg && (
                <p className={`mb-4 text-sm p-3 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {msg.texto}
                </p>
              )}

              {tab === "perfil" && (
                <form onSubmit={guardarPerfil} className="flex flex-col gap-4 max-w-md">
                  <h2 className="font-bold text-ink">Datos personales</h2>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Nombre y apellido
                    <input
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Teléfono / WhatsApp
                    <input
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="964 123 456"
                      className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Correo
                    <input value={user.email ?? ""} disabled className="h-11 px-3 bg-slate-50 rounded-lg text-sm text-slate-500" />
                  </label>
                  <button
                    disabled={guardandoPerfil}
                    className="h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-60"
                  >
                    {guardandoPerfil ? "Guardando…" : "Guardar cambios"}
                  </button>
                </form>
              )}

              {tab === "direcciones" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-ink">Mis direcciones</h2>
                    <button
                      onClick={() => setMostrarDir((v) => !v)}
                      className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>Agregar
                    </button>
                  </div>

                  {mostrarDir && (
                    <form onSubmit={guardarDireccion} className="bg-slate-50 p-4 rounded-xl flex flex-col gap-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={dirForm.alias}
                          onChange={(e) => setDirForm({ ...dirForm, alias: e.target.value })}
                          placeholder="Alias (Casa, Trabajo)"
                          className="h-10 px-3 rounded-lg bg-white text-sm ring-1 ring-slate-200"
                        />
                        <input
                          value={dirForm.direccion}
                          onChange={(e) => setDirForm({ ...dirForm, direccion: e.target.value })}
                          placeholder="Calle y número"
                          required
                          className="h-10 px-3 rounded-lg bg-white text-sm ring-1 ring-slate-200"
                        />
                      </div>
                      <input
                        value={dirForm.referencia}
                        onChange={(e) => setDirForm({ ...dirForm, referencia: e.target.value })}
                        placeholder="Referencia (opcional)"
                        className="h-10 px-3 rounded-lg bg-white text-sm ring-1 ring-slate-200"
                      />
                      <button className="h-10 rounded-lg bg-ink text-white text-sm font-semibold">Guardar dirección</button>
                    </form>
                  )}

                  {(perfil?.direcciones ?? []).length === 0 ? (
                    <div className="text-center py-10 text-sm text-slate-500 bg-slate-50 rounded-xl">
                      Aún no tienes direcciones guardadas.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {(perfil?.direcciones ?? []).map((d) => (
                        <li key={d.id} className="flex items-start justify-between gap-3 p-4 rounded-xl ring-1 ring-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink">{d.alias}</span>
                              {d.principal && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  Principal
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{d.direccion}</p>
                            {d.referencia && <p className="text-xs text-slate-400">{d.referencia}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!d.principal && (
                              <button onClick={() => marcarPrincipal(d.id)} className="text-xs font-semibold text-brand-600 hover:underline">
                                Usar
                              </button>
                            )}
                            <button onClick={() => borrarDireccion(d.id)} className="text-slate-400 hover:text-red-600" aria-label="Eliminar dirección">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === "seguridad" && (
                <form onSubmit={cambiarClave} className="flex flex-col gap-4 max-w-md">
                  <h2 className="font-bold text-ink">Cambiar contraseña</h2>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Contraseña actual
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={passActual}
                      onChange={(e) => setPassActual(e.target.value)}
                      className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Nueva contraseña
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={passNueva}
                      onChange={(e) => setPassNueva(e.target.value)}
                      className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
                    Repetir nueva contraseña
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={passRepetir}
                      onChange={(e) => setPassRepetir(e.target.value)}
                      className="h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </label>
                  <button
                    disabled={cambiando}
                    className="h-11 rounded-lg bg-ink text-white font-semibold disabled:opacity-60"
                  >
                    {cambiando ? "Actualizando…" : "Actualizar contraseña"}
                  </button>
                  <p className="text-xs text-slate-500">
                    ¿No recuerdas tu contraseña?{" "}
                    <Link href="/cuenta/recuperar" className="text-brand-600 font-semibold hover:underline">
                      Envíate un enlace de recuperación
                    </Link>
                    .
                  </p>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
