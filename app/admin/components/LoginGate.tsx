"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authErrorMessage, signInAdmin } from "@/lib/firebase/auth";

export default function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-canvas grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-md ring-1 ring-slate-900/5 p-8 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Image src="/imagenes/logo.jpg" alt="Logo El Mesón" width={40} height={40} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200" />
          <div className="flex flex-col">
            <span className="font-bold text-ink">El Mesón</span>
            <span className="text-xs text-brand-600 uppercase tracking-wider">Panel de Control</span>
          </div>
        </div>
        <p className="text-sm text-slate-500">Acceso restringido al personal autorizado.</p>
        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
          Correo
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-3 bg-slate-100 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
            placeholder="admin@elmeson.com"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1.5">
          Contraseña
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-3 bg-slate-100 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
            placeholder="••••••••"
          />
        </label>
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
        <Link href="/" className="text-center text-sm text-slate-500 hover:text-ink">Volver a la tienda</Link>
      </form>
    </div>
  );
}
