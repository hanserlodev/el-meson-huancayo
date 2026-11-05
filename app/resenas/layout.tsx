import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Reseñas de clientes",
  description:
    "Lee las reseñas de quienes ya probaron el pollo a la brasa y las parrillas de El Mesón en Huancayo, y comparte tu experiencia con nosotros.",
  path: "/resenas",
});

export default function ResenasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
