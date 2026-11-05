import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Carta: pollo a la brasa y parrillas",
  description:
    "Conoce la carta completa de El Mesón: pollo a la brasa, parrillas, anticuchos, combos familiares, guarniciones, bebidas y postres. Precios en soles y delivery en Huancayo.",
  path: "/carta",
});

export default function CartaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
