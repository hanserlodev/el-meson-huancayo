import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { PLATOS as PLATOS_LOCAL, type Plato } from "@/lib/data";

// Fallback local (BaaS aún sin datos) -> si Firestore vacío, usa PLATOS_LOCAL
// Cuando migres datos a Firestore colección "platos", este servicio ya funciona sin tocar UI
export async function getPlatos(): Promise<Plato[]> {
  try {
    const snap = await getDocs(collection(db, "platos"));
    if (snap.empty) return PLATOS_LOCAL;
    return snap.docs.map((d) => d.data() as Plato);
  } catch {
    return PLATOS_LOCAL;
  }
}

export function subscribePlatos(cb: (platos: Plato[]) => void, cat?: string) {
  try {
    const ref = collection(db, "platos");
    const q = cat && cat !== "todos" ? query(ref, where("cat", "==", cat)) : query(ref);
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) cb(PLATOS_LOCAL.filter((p) => !cat || cat === "todos" || p.cat === cat));
        else cb(snap.docs.map((d) => d.data() as Plato));
      },
      () => cb(PLATOS_LOCAL.filter((p) => !cat || cat === "todos" || p.cat === cat))
    );
  } catch {
    cb(PLATOS_LOCAL);
    return () => {};
  }
}
