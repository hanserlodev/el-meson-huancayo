import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Mis pedidos",
  description: "Consulta el estado de tus pedidos de El Mesón con tu código de seguimiento en tiempo real.",
  path: "/pedidos",
  noindex: true,
});

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
