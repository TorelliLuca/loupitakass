import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { languageAlternates, localizedPath } from "@/lib/seo";

/** Path pubblici (one-page, storia, link-in-bio, privacy). */
const PUBLIC_PATHS = ["", "/storia", "/links", "/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: localizedPath(routing.defaultLocale as AppLocale, path),
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === "" ? 1 : path === "/storia" ? 0.6 : path === "/links" ? 0.7 : 0.4,
    alternates: {
      languages: languageAlternates(path),
    },
  }));
}
