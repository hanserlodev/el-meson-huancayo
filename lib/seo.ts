import type { Metadata } from "next";

export const SITE_URL = "https://el-meson-huancayo.web.app";
export const SITE_NAME = "El Mesón";
export const OG_IMAGE = "/imagenes/og-meson.jpg";
export const OG_ALT = "Pollo a la brasa de El Mesón con papas fritas";
export const DESCRIPCION =
  "Pollos y Parrillas El Mesón — pollo a la brasa al carbón, parrillas, anticuchos y la famosa ensalada dulce en Huancayo. Pide delivery o reserva tu mesa.";

const OG_BASE = {
  siteName: SITE_NAME,
  locale: "es_PE",
  type: "website" as const,
  images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
};

/** Metadatos completos (SEO + redes) para una página interna. */
export function paginaMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const { title, description, path, noindex } = opts;
  const ogTitle = `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_BASE, title: ogTitle, description, url: path },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [OG_IMAGE] },
    ...(noindex
      ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }
      : {}),
  };
}

/** Datos estructurados schema.org del restaurante (SEO local). */
export const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurante`,
  name: "Pollos y Parrillas El Mesón",
  alternateName: "El Mesón",
  url: SITE_URL,
  logo: `${SITE_URL}/imagenes/logo.jpg`,
  image: [`${SITE_URL}${OG_IMAGE}`, `${SITE_URL}/imagenes/cuarto-brasa.webp`],
  description: DESCRIPCION,
  telephone: "+51 939 399 946",
  priceRange: "S/ 10 - S/ 70",
  servesCuisine: ["Pollo a la brasa", "Parrillas", "Comida peruana"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Giráldez 157",
    addressLocality: "Huancayo",
    addressRegion: "Junín",
    postalCode: "12001",
    addressCountry: "PE",
  },
  areaServed: { "@type": "City", name: "Huancayo" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "23:00",
    },
  ],
  hasMenu: `${SITE_URL}/carta`,
  menu: `${SITE_URL}/carta`,
  acceptsReservations: "True",
  currenciesAccepted: "PEN",
  paymentAccepted: "Efectivo, Yape, Plin, Tarjeta",
};
