import type { MetadataRoute } from "next";
import { SITE, CITIES } from "@/lib/site";
import { HUB_SLUGS } from "@/lib/seoContent";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticPaths: { url: string; priority: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" },
    { url: "/como-funciona", priority: 0.9, changeFrequency: "monthly" },
    { url: "/para-quien-es", priority: 0.8, changeFrequency: "monthly" },
    { url: "/casos-de-uso", priority: 0.8, changeFrequency: "monthly" },
    { url: "/donar", priority: 0.9, changeFrequency: "weekly" },
    { url: "/rescatistas", priority: 0.8, changeFrequency: "monthly" },
    { url: "/veterinarias", priority: 0.8, changeFrequency: "monthly" },
    { url: "/alertas", priority: 0.7, changeFrequency: "monthly" },
    { url: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { url: "/contacto", priority: 0.6, changeFrequency: "monthly" },
    { url: "/registro", priority: 0.9, changeFrequency: "weekly" },
    { url: "/ciudades", priority: 0.8, changeFrequency: "weekly" },
    { url: "/privacidad", priority: 0.2, changeFrequency: "yearly" },
    { url: "/terminos", priority: 0.2, changeFrequency: "yearly" },
  ];

  const hubPaths = HUB_SLUGS.map((slug) => ({
    url: `/${slug}`,
    priority: 0.9,
    changeFrequency: "weekly" as const,
  }));

  const cityPaths = CITIES.map((c) => ({
    url: `/ciudades/${c.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPaths, ...hubPaths, ...cityPaths].map((p) => ({
    url: `${base}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
