import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/lib/site";

/** Path pubblici (one-page, storia, link-in-bio, privacy). */
const PUBLIC_PATHS = ["", "/storia", "/links", "/privacy"] as const;

function localizedUrl(locale: AppLocale, path: string): string {
  const base = site.domain.replace(/\/$/, "");
  const suffix = path === "" ? "" : path;

  if (locale === routing.defaultLocale) {
    return `${base}${suffix}`;
  }

  return `${base}/${locale}${suffix}`;
}

function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localizedUrl(routing.defaultLocale, path),
  };

  for (const locale of routing.locales) {
    languages[locale] = localizedUrl(locale, path);
  }

  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: localizedUrl(routing.defaultLocale, path),
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === "" ? 1 : path === "/storia" ? 0.6 : path === "/links" ? 0.7 : 0.4,
    alternates: {
      languages: languageAlternates(path),
    },
  }));
}
