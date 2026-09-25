import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/stores/cart";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600","700","800"], display: "swap" });

export const metadata: Metadata = {
  title: "El Mesón — Pollos y Parrillas en Huancayo",
  description: "Pollos y Parrillas El Mesón — pollo a la brasa y parrillas al carbón en Av. Giráldez 157, Huancayo. Pide online o reserva tu mesa.",
  icons: { icon: "/imagenes/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-bg-canvas text-on-surface"><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
