"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authErrorMessage, sendResetEmail } from "@/lib/firebase/auth";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ texto: string; ok: boolean } | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setMsg(null);
    setEnviando(true);
    try {
      await sendResetEmail(email.trim());
      setMsg({
        texto: "Te enviamos un correo con el enlace para restablecer tu contraseña. Revisa también spam.",
        ok: true,
      });
      setEmail("");
    } catch (err) {
      setMsg({ texto: authErrorMessage(err), ok: false });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-900/5 p-6 sm:p-8">
          <span className="material-symbols-outlined text-3xl text-brand-600">lock</span>
          <h1 className="text-2xl font-display font-bold text-ink mt-2">Recuperar contraseña</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
          </p>

          <form onSubmit={enviar} className="flex flex-col gap-4">
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

            {msg && (
              <p className={`text-sm p-3 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                {msg.texto}
              </p>
            )}

            <button
              disabled={enviando}
              className="h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar enlace"}
            </button>

            <Link href="/cuenta" className="text-center text-sm text-slate-500 hover:text-ink">
              Volver a mi cuenta
            </Link>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
