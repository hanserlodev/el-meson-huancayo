export type TipoOfertaLocal = "martes" | "combo" | "delivery" | "descuento";

export interface OfertaLocal {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoOfertaLocal;
  precioOferta?: number;
  activo: boolean;
}

/**
 * Ofertas de respaldo que se muestran en el HTML inicial, antes de que
 * Firestore responda. Módulo sin dependencias para no cargar Firebase.
 */
export const OFERTAS_LOCAL: OfertaLocal[] = [
  {
    id: "of-1",
    titulo: "Martes de Pollo — S/ 13.90",
    descripcion: "1/4 pollo + papas + ensalada todos los martes",
    tipo: "martes",
    precioOferta: 13.9,
    activo: true,
  },
  {
    id: "of-2",
    titulo: "Combo Familiar S/ 46.90",
    descripcion: "Pollo entero + gaseosa 1.5L + papas familiares",
    tipo: "combo",
    precioOferta: 46.9,
    activo: true,
  },
  {
    id: "of-3",
    titulo: "Delivery Gratis",
    descripcion: "En pedidos mayores a S/ 35 por Huancayo centro",
    tipo: "delivery",
    activo: true,
  },
];
