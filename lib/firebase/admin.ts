import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Solo para Server Actions / Functions cuando se configuren credenciales
// Requiere FIREBASE_ADMIN_* en .env
const adminApp =
  getApps().length === 0
    ? initializeApp(
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
          ? {
              credential: cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
              }),
            }
          : undefined
      )
    : getApps()[0];

export const adminDb = adminApp ? getFirestore(adminApp) : null;
