import { resenasRepo, type EstadoResena, type ResenaRow } from "@/lib/repositories/resenas.repo";
import { parseOrThrow } from "@/lib/schemas/parse";
import { resenaSchema } from "@/lib/schemas/resena.schema";

export type { EstadoResena };
export type ResenaDoc = ResenaRow & { id: string; createdAt?: unknown };

export async function crearResena(data: Omit<ResenaDoc, "id" | "estado" | "createdAt">) {
  const safe = parseOrThrow(resenaSchema, data);
  return resenasRepo.create({ ...safe, estado: "pendiente" });
}

export function subscribeResenas(
  cb: (data: ResenaDoc[]) => void,
  platoId?: string,
  soloAprobadas = false
) {
  return resenasRepo.listen(
    (rows) => {
      let arr = rows;
      if (platoId) arr = arr.filter((r) => r.platoId === platoId);
      if (soloAprobadas) arr = arr.filter((r) => r.estado === "aprobada");
      cb(arr);
    },
    () => cb([])
  );
}

export async function getResenasAprobadas(platoId?: string): Promise<ResenaDoc[]> {
  try {
    const rows = await resenasRepo.list();
    let arr = rows.filter((r) => r.estado === "aprobada");
    if (platoId) arr = arr.filter((r) => r.platoId === platoId);
    return arr;
  } catch {
    return [];
  }
}

export async function updateEstadoResena(id: string, estado: EstadoResena) {
  return resenasRepo.updateEstado(id, estado);
}

export async function deleteResena(id: string) {
  return resenasRepo.remove(id);
}
