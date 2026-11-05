import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Ofertas y promociones",
  description:
    "Promos vigentes de El Mesón en Huancayo: martes de pollo, combos familiares, delivery gratis desde S/ 35 y descuentos con cupón. Aprovecha las ofertas de la semana.",
  path: "/ofertas",
});

export default function OfertasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
