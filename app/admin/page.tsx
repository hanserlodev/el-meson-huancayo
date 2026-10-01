"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPanel from "./components/AdminPanel";
import LoginGate from "./components/LoginGate";
import { isAdminUser, signOutAdmin, subscribeAuthState, type User } from "@/lib/firebase/auth";

function LoadingScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-bg-canvas">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span className="material-symbols-outlined text-4xl animate-spin text-brand-600">progress_activity</span>
        <span className="text-sm">Verificando sesión…</span>
      </div>
    </div>
  );
}

function NoAutorizado({ email }: { email?: string | null }) {
  return (
    <div className="min-h-screen grid place-items-center bg-bg-canvas px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md ring-1 ring-slate-900/5 p-8 flex flex-col gap-4 text-center">
        <span className="material-symbols-outlined text-4xl text-red-500">lock</span>
        <h1 className="font-bold text-ink text-lg">Acceso denegado</h1>
        <p className="text-sm text-slate-500">
          {email ? `${email} no tiene permisos de administrador.` : "Tu cuenta no tiene permisos de administrador."}
        </p>
        <button onClick={() => signOutAdmin()} className="h-11 bg-ink text-white rounded-lg font-semibold">Cerrar sesión</button>
        <Link href="/" className="text-sm text-slate-500 hover:text-ink">Volver a la tienda</Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeAuthState(async (u) => {
      if (!active) return;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const admin = await isAdminUser(u);
      if (!active) return;
      setIsAdmin(admin);
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginGate />;
  if (!isAdmin) return <NoAutorizado email={user.email} />;
  return <AdminPanel email={user.email} />;
}
