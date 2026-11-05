import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Tu pedido",
  description: "Revisa tu pedido, aplica cupones y confirma tu delivery o recojo en El Mesón Huancayo.",
  path: "/carrito",
  noindex: true,
});

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
