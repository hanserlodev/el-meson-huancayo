# Explicación del código JavaScript

A continuación se explica el código de los tres archivos JS/TS del CRUD de **Platos — Pollos y Parrillas El Mesón**, bloque por bloque, en el mismo orden en el que se ejecutan y se relacionan entre sí.

---

## Archivo: `lib/firebase/client.ts`

Este archivo se encarga únicamente de configurar la conexión con Firebase y exportar la base de datos para que los demás archivos la puedan usar.

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
```

**Explicación:** Se importan las funciones desde los módulos oficiales del SDK Modular v12 de Firebase. `initializeApp` sirve para inicializar la conexión con el proyecto, `getFirestore` para obtener la base de datos Firestore, `getAuth` para autenticación y `getStorage` para el almacenamiento de imágenes. A diferencia de la CDN `gstatic` del ejemplo, aquí se usa el SDK instalado con `pnpm add firebase`.

```ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuildNotReal1234567890",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "el-meson-huancayo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "el-meson-huancayo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "el-meson-huancayo.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:dummy",
};
```

**Explicación:** Se define el objeto con las credenciales del proyecto de Firebase. Estos datos identifican a qué proyecto conectarse y se toman de las variables de entorno `NEXT_PUBLIC_*` (definidas en `.env.local` a partir de `.env.example`). Se usa `|| "dummy"` como fallback para que `pnpm build` no falle en el servidor sin credenciales reales — en local sin `.env` usa el proyecto `el-meson-huancayo` con claves dummy.

```ts
// Evita reinicializar en hot-reload y permite build sin .env (fallback dummy)
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
```

**Explicación:** Con `getApps().length ? getApp() : initializeApp(firebaseConfig)` se evita reinicializar la app en hot-reload de Next.js (si ya existe, la reutiliza). Luego se obtienen las referencias a Firestore (`db`), Auth y Storage y se exportan. `db` es la que importará `platos.service.ts` para hacer el CRUD.

---

## Archivo: `lib/services/platos.service.ts`

Este archivo concentra toda la lógica de acceso a datos (el CRUD) contra Firestore, separada del resto de la aplicación. Es el equivalente a `personaService.js` pero para la colección `platos`.

```ts
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { PLATOS as PLATOS_LOCAL, type Plato } from "@/lib/data";
```

**Explicación:** Se importa `db` configurada en `client.ts` y el arreglo `PLATOS` local de `lib/data.ts` (9 platos de respaldo). Además se importan las funciones de Firestore que se usarán: `collection` (referenciar colección), `addDoc` (crear), `getDocs` (leer una vez), `onSnapshot` (tiempo real), `doc`/`updateDoc`/`deleteDoc` (referenciar y modificar un documento), `query`/`where` (filtrar por categoría).

```ts
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
```

**Explicación:** Es la función que lee todos los platos una sola vez (READ). Intenta traer con `getDocs` la colección `platos`. Si está vacía o hay error (sin credenciales), retorna `PLATOS_LOCAL` de `lib/data.ts`. Así el CRUD funciona en local sin Firestore y en producción con datos reales sin cambiar la UI.

```ts
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
```

**Explicación:** Similar a `escucharPersonas` del ejemplo pero para platos. Se queda escuchando cambios en tiempo real con `onSnapshot`. Si se filtra por `cat` arma un `query(where("cat","==",cat))`. Cada vez que se agrega, edita o elimina un plato, el callback `cb` recibe el arreglo actualizado y la UI (`app/admin/page.tsx`) se repinta sola. El `try/catch` con fallback a `PLATOS_LOCAL` permite que el admin funcione sin conexión.

```ts
// CREATE
export async function createPlato(plato: Plato) {
  return addDoc(collection(db, "platos"), { ...plato, createdAt: new Date().toISOString() });
}
```

**Explicación:** Es la función que crea un nuevo plato (CREATE). Recibe un objeto `Plato` (con `id`, `nombre`, `precio`, `cat`, `desc`, `img`…) y usa `addDoc` para insertarlo en la colección `platos`. Al igual que `agregarPersona`, es asíncrona y agrega `createdAt` para ordenar.

```ts
// UPDATE
export async function updatePlato(id: string, data: Partial<Plato>) {
  return updateDoc(doc(db, "platos", id), data as Record<string, unknown>);
}
```

**Explicación:** Actualiza un plato existente (UPDATE). Recibe el `id` del documento y los campos a modificar. Con `doc(db,"platos",id)` arma la referencia directa a ese documento y con `updateDoc` sobrescribe solo los campos enviados (nombre, precio, etc.).

```ts
// DELETE
export async function deletePlato(id: string) {
  return deleteDoc(doc(db, "platos", id));
}
```

**Explicación:** Elimina un plato (DELETE). Arma la referencia con `doc` y lo borra con `deleteDoc`.

```ts
export async function toggleActivoPlato(id: string, activo: boolean) {
  return updateDoc(doc(db, "platos", id), { activo });
}

export async function uploadPlatoFoto(file: File, platoId: string) {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase/client");
  const r = ref(storage, `platos/${platoId}/${file.name}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
```

**Explicación:** Funciones auxiliares del CRUD: `toggleActivoPlato` cambia el campo `activo` para pausar un plato sin borrarlo (equivale a cambiar `stock` a `Agotado`), y `uploadPlatoFoto` sube la imagen a Firebase Storage en `platos/{id}/{file}` y retorna la URL para guardarla en el documento.

---

## Archivo: `app/admin/page.tsx`

Este archivo conecta la interfaz (el HTML/React del panel) con la lógica de `platos.service.ts`. Se encarga de capturar los datos del formulario, mostrar la tabla y manejar los botones de editar, eliminar y toggle. Es el equivalente a `app.js` pero con Hooks de React.

```ts
"use client";

import { useEffect, useState } from "react";
import { PLATOS as PLATOS_INIT, type Plato } from "@/lib/data";
import { createPlato, deletePlato, subscribePlatos, updatePlato } from "@/lib/services/platos.service";

type Tab = "menu" | "reservas" | "delivery";
type Stock = "Activo" | "Bajo" | "Agotado";

interface AdminPlato extends Plato {
  activo: boolean;
  stock: Stock;
}
```

**Explicación:** Se declara `"use client"` para que sea componente de cliente (pueda usar estado y Firestore). Se importan las cuatro funciones CRUD desde `platos.service.ts` y el arreglo inicial `PLATOS_INIT` de `lib/data.ts`. Se definen los tipos `Tab` y `Stock` y la interfaz `AdminPlato` que extiende `Plato` con `activo` y `stock` para el control visual del admin.

```ts
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("menu");
  const [platos, setPlatos] = useState<AdminPlato[]>(
    PLATOS_INIT.map((p) => ({ ...p, activo: true, stock: "Activo" as Stock }))
  );
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cat: "Brasas", precio: "", stock: "Activo" as Stock, desc: "" });
```

**Explicación:** Se capturan todos los estados que se van a manipular: `tab` para las pestañas, `platos` (arreglo en memoria, inicia con `PLATOS_INIT`), `search` y `catFilter` para filtros, `showForm`/`editingId`/`form` para el formulario. Es el equivalente a los `getElementById` del ejemplo pero con `useState`.

```ts
  // Subscribe to Firestore (fallback to local if not configured)
  useEffect(() => {
    const unsub = subscribePlatos((data) => {
      if (data.length) setPlatos(data.map((p) => ({ ...p, activo: true, stock: "Activo" } as AdminPlato)));
    });
    return () => unsub();
  }, []);
```

**Explicación:** Aquí se llama a `subscribePlatos` (la función en tiempo real). Cada vez que cambia algo en Firestore, el callback actualiza `platos` y la tabla se repinta sola, igual que `escucharPersonas((datos)=>{personas=datos; mostrarPersonas()})` del ejemplo pero con `useEffect` y `unsub` para limpiar la suscripción.

```ts
  const filtered = platos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "todas" || p.cat.toLowerCase() === catFilter.toLowerCase() || (catFilter === "Brasas" && p.cat === "brasa") || (catFilter === "Parrillas" && p.cat === "parrilla") || (catFilter === "Bebidas" && p.cat === "extra");
    return matchSearch && matchCat;
  });
```

**Explicación:** Filtra los platos en memoria por búsqueda y categoría, equivalente al `filterPlatos`/`setCategoryFilter` del admin Stitch pero con `filter` de React. Se usa para pintar solo los que coinciden en la tabla.

```ts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio);
    if (!form.nombre || isNaN(precio) || precio <= 0) return;
    const catMap: Record<string, Plato["cat"]> = { Brasas: "brasa", Parrillas: "parrilla", Bebidas: "extra", Guarniciones: "extra" };
    const cat = catMap[form.cat] || "brasa";
    if (editingId) {
      const updated: Partial<Plato> = { nombre: form.nombre, precio, cat, desc: form.desc, tag: form.stock === "Agotado" ? "Agotado" : "" };
      try {
        await updatePlato(editingId, updated);
      } catch {}
      setPlatos((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated, stock: form.stock, activo: form.stock !== "Agotado" } as AdminPlato : p)));
    } else {
      const newPlato: Plato = {
        id: `plato-${Date.now()}`,
        nombre: form.nombre,
        precio,
        cat,
        desc: form.desc || "Receta especial de la casa",
        img: "/imagenes/cuarto-brasa.png",
        tag: form.stock === "Agotado" ? "Agotado" : "",
        rating: "★★★★★",
        votos: 0,
        activo: form.stock !== "Agotado",
      };
      try {
        await createPlato(newPlato);
      } catch {}
      setPlatos((prev) => [{ ...newPlato, stock: form.stock } as AdminPlato, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nombre: "", cat: "Brasas", precio: "", stock: "Activo", desc: "" });
  };
```

**Explicación:** Es el `submit` del formulario, equivalente al `formulario.addEventListener("submit",...)` del ejemplo. Con `e.preventDefault()` evita recargar. Valida `nombre` y `precio>0`, mapea `Brasas→brasa` etc. Dentro de `try/catch`: si `editingId` existe es edición → llama a `updatePlato` (como `actualizarPersona`); si no, es creación → `createPlato` (como `agregarPersona`). En ambos casos hace optimistic update local con `setPlatos` para que se vea al instante aunque Firestore falle (sin `.env`).

```ts
  const editDish = (p: AdminPlato) => {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, cat: p.cat === "brasa" ? "Brasas" : p.cat === "parrilla" ? "Parrillas" : "Bebidas", precio: String(p.precio), stock: p.stock, desc: p.desc });
    setShowForm(true);
  };
```

**Explicación:** Igual que `window.editarPersona` del ejemplo pero con estado React. Busca el plato por `id` (ya lo recibe como objeto), llena el formulario con sus datos, pone `editingId` y muestra el form. Es llamada desde `onClick={() => editDish(p)}` de cada fila.

```ts
  const delDish = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este plato de la carta de El Mesón?")) return;
    try {
      await deletePlato(id);
    } catch {}
    setPlatos((prev) => prev.filter((p) => p.id !== id));
  };
```

**Explicación:** Igual que `window.eliminarPersona` pero con `confirm` y `deletePlato` (como `eliminarPersona`). Si confirma, intenta borrar en Firestore y siempre filtra el arreglo local.

```ts
  const toggleStock = (id: string) => {
    setPlatos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next: Stock = p.stock === "Activo" ? "Agotado" : p.stock === "Agotado" ? "Bajo" : "Activo";
        return { ...p, stock: next, activo: next !== "Agotado" };
      })
    );
  };
```

**Explicación:** Alterna `Activo→Agotado→Bajo` sin ir a Firestore (solo visual), equivalente al `toggleStockStatus` del Stitch original. Cambia el `stock` y `activo` en memoria.

```tsx
  return (
    <div className="min-h-screen bg-bg-canvas">
      {/* tabla */}
      {filtered.map((p) => (
        <tr key={p.id}>
          <td>{p.nombre}</td>
          <td>S/ {p.precio.toFixed(2)}</td>
          <td>
            <button onClick={() => editDish(p)}>edit</button>
            <button onClick={() => toggleStock(p.id)}>sync_alt</button>
            <button onClick={() => delDish(p.id)}>delete</button>
          </td>
        </tr>
      ))}
    </div>
  );
```

**Explicación:** Pinta la tabla con `filtered.map`, equivalente a `mostrarPersonas` con `forEach` y `innerHTML` pero con JSX. Cada fila tiene los tres botones CRUD con `onClick` directos (no `onclick="editarPersona('${id}')"`). El contador `Mostrando {filtered.length} de {platos.length}` y el indicador `Firestore: conectado/local` son el equivalente al `contador` y `mensaje` del ejemplo.
