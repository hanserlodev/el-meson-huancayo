import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = paginaMetadata({
  title: "Reserva tu mesa",
  description:
    "Reserva mesa en El Mesón Huancayo para 1 a 20 personas, de 11:00 a 23:00, en nuestras sedes de Av. Giráldez 157 y Calle Real 919. Confirmación inmediata.",
  path: "/reserva",
});

export default function ReservaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
