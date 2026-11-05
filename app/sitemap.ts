import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/carta`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/ofertas`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/reserva`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/resenas`, lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];
}
