#!/usr/bin/env node
/**
 * Crea el cupón de demostración MESON10 (10% desde S/ 25).
 * Uso: node scripts/seed-cupones.mjs
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

const db = getFirestore();
await db.collection("cupones").doc("meson10").set(
  { codigo: "MESON10", tipo: "porcentaje", valor: 10, minimo: 25, activo: true, expira: "2026-12-31" },
  { merge: true },
);
console.log("Cupón MESON10 creado (10% desde S/ 25, vence 2026-12-31).");
