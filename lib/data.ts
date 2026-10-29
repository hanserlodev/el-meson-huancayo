import PLATOS_DATA from "@/lib/platos.json";

export type Categoria = "brasa" | "parrilla" | "extra";

export interface Plato {
  id: string;
  nombre: string;
  precio: number;
  cat: Categoria;
  desc: string;
  img: string;
  tag: string;
  rating: string;
  votos: number;
  activo?: boolean;
}

export const PLATOS: Plato[] = PLATOS_DATA as Plato[];

export const DELIVERY = 5;
export const ENVIO_GRATIS_DESDE = 35;

/**
 * Capacidad de comensales por sede para el chequeo de aforo al reservar.
 * Ajustable. El chequeo es best-effort en cliente (ver reservas.service.ts).
 */
export const AFORO_POR_SEDE: Record<"Giráldez" | "Real", number> = {
  "Giráldez": 60,
  "Real": 40,
};
export const WHATSAPP = "51939399946";
export const DIRECCION = "Av. Giráldez 157, Huancayo";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Pollos+y+Parrillas+El+Mes%C3%B3n+Av.+Gir%C3%A1ldez+157+Huancayo";
