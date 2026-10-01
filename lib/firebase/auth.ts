import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export type { User };

export async function signInAdmin(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/** Verifica el custom claim `admin` en el ID token del usuario. */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult();
    return token.claims.admin === true;
  } catch {
    return false;
  }
}

/** Traduce los errores comunes de Firebase Auth a mensajes en español. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "Correo inválido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales incorrectas.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu red.";
    default:
      return "No se pudo iniciar sesión.";
  }
}

export function subscribeAuthState(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
