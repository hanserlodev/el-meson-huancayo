import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Mi cuenta",
  description:
    "Ingresa a tu cuenta de El Mesón para guardar tus datos, direcciones de entrega y revisar tus pedidos.",
  path: "/cuenta",
  noindex: true,
});

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
