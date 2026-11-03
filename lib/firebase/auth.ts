import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/auth-client";

export type { User };

export async function signInUser(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Compatibilidad con el login del panel. */
export const signInAdmin = signInUser;

export async function registerUser(
  email: string,
  password: string,
  nombre: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (nombre.trim()) await updateProfile(cred.user, { displayName: nombre.trim() });
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/** Compatibilidad con el panel. */
export const signOutAdmin = signOutUser;

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(actual: string, nueva: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("Debes iniciar sesión de nuevo.");
  const credential = EmailAuthProvider.credential(user.email, actual);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, nueva);
}

/**
 * Es administrador si tiene el custom claim `admin` o si su perfil en
 * `usuarios/{uid}` tiene `rol: "admin"`.
 */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult();
    if (token.claims.admin === true) return true;
    // Se carga Firestore solo cuando hace falta comprobar el rol.
    const [{ doc, getDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("@/lib/firebase/client"),
    ]);
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    return snap.exists() && snap.data().rol === "admin";
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
    case "auth/email-already-in-use":
      return "Ese correo ya tiene una cuenta. Inicia sesión.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/missing-password":
      return "Ingresa tu contraseña.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales incorrectas.";
    case "auth/requires-recent-login":
      return "Por seguridad, vuelve a iniciar sesión para cambiar la contraseña.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu red.";
    default:
      return "No se pudo completar la operación.";
  }
}

export function subscribeAuthState(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
