"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/firebase/auth";
import { scheduleIdle } from "@/lib/idle";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    let unsubscribe: (() => void) | undefined;

    // El SDK de Auth se carga después del primer pintado para no competir con el LCP.
    const cancelarInicio = scheduleIdle(() => {
      import("@/lib/firebase/auth").then(({ subscribeAuthState }) => {
        if (cancelado) return;
        unsubscribe = subscribeAuthState((u) => {
          setUser(u);
          setLoading(false);
        });
      });
    }, 300);

    return () => {
      cancelado = true;
      cancelarInicio();
      unsubscribe?.();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
