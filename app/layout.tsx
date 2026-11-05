import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/stores/cart";
import { AuthProvider } from "@/components/AuthProvider";
import { DESCRIPCION, OG_ALT, OG_IMAGE, SITE_NAME, SITE_URL, restaurantJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600","700","800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "El Mesón — Pollos y Parrillas en Huancayo",
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPCION,
  applicationName: SITE_NAME,
  keywords: [
    "pollo a la brasa Huancayo",
    "parrillas Huancayo",
    "restaurante Huancayo",
    "El Mesón Huancayo",
    "delivery Huancayo",
    "anticuchos",
    "chicha morada",
  ],
  authors: [{ name: "Pollos y Parrillas El Mesón" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "restaurant",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: SITE_NAME,
    title: "El Mesón — Pollos y Parrillas en Huancayo",
    description: DESCRIPCION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Mesón — Pollos y Parrillas en Huancayo",
    description: DESCRIPCION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/imagenes/logo.jpg", apple: "/imagenes/logo.jpg" },
  formatDetection: { telephone: true, address: true, email: true },
  other: { "geo.region": "PE-JUN", "geo.placename": "Huancayo" },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable} scroll-smooth`}>
      <head>
        <link rel="preload" href="/fonts/material-symbols.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="font-sans antialiased bg-bg-canvas text-on-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
