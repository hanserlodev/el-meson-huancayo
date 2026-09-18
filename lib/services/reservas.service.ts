import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface ReservaInput {
  nombre: string;
  personas: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
}

export async function crearReserva(data: ReservaInput) {
  // Validación espejo de reservas.server (defensa en cliente + servidor)
  if (data.nombre.trim().length < 2) throw new Error("Ingresa tu nombre");
  if (!data.fecha) throw new Error("Elige la fecha");
  if (!data.hora) throw new Error("Elige la hora");
  if (data.hora < "11:00" || data.hora > "23:00") throw new Error("Atendemos de 11:00 a 23:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (new Date(data.fecha + "T00:00:00") < hoy) throw new Error("La fecha no puede ser pasada");

  return addDoc(collection(db, "reservas"), {
    ...data,
    personas: Number(data.personas),
    estado: "confirmada",
    createdAt: serverTimestamp(),
  });
}
