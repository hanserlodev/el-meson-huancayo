import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "primary-container": "#cc4900",
          "on-surface": "#0b1c30",
          "background": "#f8f9ff",
          "secondary-fixed": "#dae2fd",
          "brasa-deep": "#9a3412",
          "on-tertiary-fixed": "#2a1700",
          "surface-dim": "#cbdbf5",
          "surface-container-highest": "#d3e4fe",
          "border-subtle": "#f1f5f9",
          "on-tertiary-fixed-variant": "#653e00",
          "surface": "#f8f9ff",
          "inverse-primary": "#ffb599",
          "outline": "#8e7166",
          "on-tertiary-container": "#fffbff",
          "inverse-surface": "#213145",
          "error": "#ba1a1a",
          "tertiary-container": "#a36700",
          "surface-container-low": "#eff4ff",
          "brasa-charcoal": "#431407",
          "primary-fixed-dim": "#ffb599",
          "on-surface-variant": "#5a4138",
          "surface-bright": "#f8f9ff",
          "tertiary": "#825100",
          "on-secondary-fixed-variant": "#3f465c",
          "border-default": "#e2e8f0",
          "on-error-container": "#93000a",
          "tertiary-fixed-dim": "#ffb95f",
          "on-secondary-container": "#5c647a",
          "secondary-fixed-dim": "#bec6e0",
          "surface-container-high": "#dce9ff",
          "primary": "#a33900",
          "on-tertiary": "#ffffff",
          "outline-variant": "#e2bfb2",
          "on-error": "#ffffff",
          "surface-container-lowest": "#ffffff",
          "secondary-container": "#dae2fd",
          "surface-tint": "#a73a00",
          "on-primary-fixed": "#370e00",
          "on-primary-container": "#fffbff",
          "bg-canvas": "#f8fafc",
          "inverse-on-surface": "#eaf1ff",
          "on-primary": "#ffffff",
          "tertiary-fixed": "#ffddb8",
          "primary-fixed": "#ffdbce",
          "amber-badge": "#fbbf24",
          "on-primary-fixed-variant": "#7f2b00",
          "secondary": "#565e74",
          "on-background": "#0b1c30",
          "brasa-hover": "#c2410c",
          "surface-container": "#e5eeff",
          "error-container": "#ffdad6",
          "on-secondary-fixed": "#131b2e",
          "on-secondary": "#ffffff",
          "surface-variant": "#d3e4fe"
        },
        "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
        },
        "spacing": {
          "space-xs": "0.25rem",
          "space-lg": "1.5rem",
          "gutter": "1.5rem",
          "margin": "2rem",
          "space-xl": "2.5rem",
          "space-sm": "0.5rem",
          "margin-mobile": "1rem",
          "space-md": "1rem",
          "gutter-mobile": "1rem"
        },
        "fontFamily": {
          "display-lg-mobile": ["Sora"],
          "headline-lg": ["Sora"],
          "label-md": ["Inter"],
          "headline-md": ["Sora"],
          "body-lg": ["Inter"],
          "headline-xl": ["Sora"],
          "label-sm": ["Inter"],
          "body-md": ["Inter"],
          "body-sm": ["Inter"],
          "display-lg": ["Sora"],
          "label-lg": ["Inter"],
          "price-tag": ["Sora"]
        },
        "fontSize": {
          "display-lg-mobile": ["36px", {"lineHeight": "44px","letterSpacing": "-0.02em","fontWeight": "800"}],
          "headline-lg": ["24px", {"lineHeight": "32px","letterSpacing": "-0.01em","fontWeight": "700"}],
          "label-md": ["14px", {"lineHeight": "18px","fontWeight": "600"}],
          "headline-md": ["20px", {"lineHeight": "28px","fontWeight": "700"}],
          "body-lg": ["18px", {"lineHeight": "28px","fontWeight": "400"}],
          "headline-xl": ["32px", {"lineHeight": "40px","letterSpacing": "-0.015em","fontWeight": "700"}],
          "label-sm": ["12px", {"lineHeight": "16px","fontWeight": "500"}],
          "body-md": ["16px", {"lineHeight": "24px","fontWeight": "400"}],
          "body-sm": ["14px", {"lineHeight": "20px","fontWeight": "400"}],
          "display-lg": ["48px", {"lineHeight": "56px","letterSpacing": "-0.02em","fontWeight": "800"}],
          "label-lg": ["16px", {"lineHeight": "20px","fontWeight": "600"}],
          "price-tag": ["22px", {"lineHeight": "26px","letterSpacing": "-0.02em","fontWeight": "800"}]
        }
      }
    }
  }`,
          }}
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="font-sans antialiased bg-bg-canvas text-on-surface">{children}</body>
    </html>
  );
}
