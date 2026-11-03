import { usuariosRepo, type UsuarioRow, type UsuarioWithId } from "@/lib/repositories/usuarios.repo";
import { perfilUpdateSchema, type PerfilUpdateInput } from "@/lib/schemas/usuario.schema";
import { parseOrThrow } from "@/lib/schemas/parse";
import type { User } from "firebase/auth";

export type UsuarioDoc = UsuarioWithId;

/** Crea el perfil en `usuarios/{uid}` la primera vez que entra la cuenta. */
export async function asegurarPerfil(user: User): Promise<UsuarioDoc> {
  const existente = await usuariosRepo.get(user.uid);
  if (existente) return existente;

  const row: UsuarioRow = {
    nombre: user.displayName?.trim() || user.email?.split("@")[0] || "Cliente",
    email: user.email ?? "",
    telefono: "",
    direcciones: [],
    rol: "cliente",
    creadoEn: new Date().toISOString(),
  };
  await usuariosRepo.create(user.uid, row);
  return { ...row, id: user.uid };
}

export function obtenerPerfil(uid: string): Promise<UsuarioDoc | null> {
  return usuariosRepo.get(uid);
}

export function suscribirPerfil(
  uid: string,
  cb: (perfil: UsuarioDoc | null) => void,
  onError?: (e: unknown) => void
): () => void {
  return usuariosRepo.listen(uid, cb, onError);
}

export async function actualizarPerfil(uid: string, data: PerfilUpdateInput): Promise<void> {
  const safe = parseOrThrow(perfilUpdateSchema, data);
  await usuariosRepo.update(uid, safe);
}

export async function listarUsuarios(): Promise<UsuarioDoc[]> {
  const rows = await usuariosRepo.list();
  return rows.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function cambiarRol(uid: string, rol: "cliente" | "admin"): Promise<void> {
  await usuariosRepo.update(uid, { rol });
}
