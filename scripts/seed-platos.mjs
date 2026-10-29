#!/usr/bin/env node
/**
 * Siembra la colección `platos` de Firestore con el catálogo completo.
 *
 * Requisitos (en .env.local o el entorno):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY
 *
 * Uso:
 *   node scripts/seed-platos.mjs [--prune]
 *
 * Cada plato se escribe con setDoc(..., { merge: true }) usando su `id` como
 * identificador, por lo que se puede volver a ejecutar sin duplicar documentos.
 * Con --prune además elimina de Firestore los platos que ya no están en el JSON.
 */
import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
    }
  } catch {
    /* .env.local es opcional */
  }
}

loadEnvLocal();

const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error("Faltan FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const platos = JSON.parse(
  readFileSync(new URL("../lib/platos.json", import.meta.url), "utf8"),
);

const db = getFirestore();
const batch = db.batch();

for (const plato of platos) {
  const { id, ...data } = plato;
  batch.set(db.collection("platos").doc(id), { ...data, activo: data.activo ?? true }, { merge: true });
}

const prune = process.argv.includes("--prune");
let eliminados = 0;
if (prune) {
  const ids = new Set(platos.map((p) => p.id));
  const snapshot = await db.collection("platos").get();
  for (const doc of snapshot.docs) {
    if (!ids.has(doc.id)) {
      batch.delete(doc.ref);
      eliminados += 1;
      console.log(`  eliminado: ${doc.id}`);
    }
  }
}

await batch.commit();
console.log(
  `Listo: ${platos.length} platos sembrados en Firestore (proyecto ${FIREBASE_ADMIN_PROJECT_ID})` +
    (prune ? `, ${eliminados} retirados.` : "."),
);
