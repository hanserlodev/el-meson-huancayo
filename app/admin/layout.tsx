import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...paginaMetadata({
    title: "Panel de administración",
    description: "Acceso restringido al personal de El Mesón.",
    path: "/admin",
    noindex: true,
  }),
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
