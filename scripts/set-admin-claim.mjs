#!/usr/bin/env node
/**
 * Asigna el custom claim { admin: true } a un usuario de Firebase Auth.
 *
 * Requisitos (en .env.local o el entorno):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY
 *
 * Uso:
 *   node scripts/set-admin-claim.mjs <uid|email>
 */
import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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

const id = process.argv[2];
if (!id) {
  console.error("Uso: node scripts/set-admin-claim.mjs <uid|email>");
  process.exit(1);
}

const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error("Faltan FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY");
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });

const authAdmin = getAuth(app);
const user = id.includes("@") ? await authAdmin.getUserByEmail(id) : await authAdmin.getUser(id);
await authAdmin.setCustomUserClaims(user.uid, { admin: true });
console.log(`✔ claim admin asignado a ${user.email || user.uid} (${user.uid})`);
