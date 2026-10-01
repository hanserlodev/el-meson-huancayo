/** Repositorio de Cloud Storage: única capa que conoce el SDK de `firebase/storage`. */
export async function uploadPlatoFoto(file: File, platoId: string): Promise<string> {
  if (!file || file.size > 5 * 1024 * 1024) throw new Error("Archivo máx 5MB");
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error("Solo JPG/PNG/WEBP");
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase/client");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const r = ref(storage, `platos/${platoId}/${Date.now()}-${safeName}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
