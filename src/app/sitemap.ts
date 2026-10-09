import type { MetadataRoute } from "next";
import { areas } from "@/lib/areas";
import { services } from "@/lib/services";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1 },
    ...Object.values(services).map(({ slug }) => ({
      url: `${SITE_URL}/${slug}`, lastModified, priority: 0.8,
    })),
    ...areas.map(({ slug }) => ({
      url: `${SITE_URL}/alueet/${slug}`, lastModified, priority: 0.7,
    })),
    ...["/alueet", "/tilaa", "/yritysasiakkaat"].map((path) => ({
      url: `${SITE_URL}${path}`, lastModified, priority: 0.6,
    })),
  ];
}
