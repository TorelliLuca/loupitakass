import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/lib/site";

/** Locale Open Graph (`it_IT`, …). */
const OG_LOCALE: Record<AppLocale, string> = {
  it: "it_IT",
  fr: "fr_FR",
  en: "en_US",
  oc: "oc_FR",
};

/**
 * Immagine social: oggi punta alla hero (`site.images.og`).
 * Quando hai un asset dedicato 1200×630, aggiorna solo `site.images.og`.
 */
export const DEFAULT_OG_IMAGE = {
  url: site.images.og,
  width: 1200,
  height: 630,
  alt: site.name,
} as const;

/** URL assoluto localizzato (`as-needed`: IT senza prefisso). */
export function localizedPath(locale: string, path = ""): string {
  const base = site.domain.replace(/\/$/, "");
  const suffix =
    path === "" || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;

  if (locale === routing.defaultLocale) {
    return `${base}${suffix}`;
  }

  return `${base}/${locale}${suffix}`;
}

/** Mappa hreflang + x-default per sitemap e Metadata API. */
export function languageAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localizedPath(routing.defaultLocale, path),
  };

  for (const locale of routing.locales) {
    languages[locale] = localizedPath(locale, path);
  }

  return languages;
}

type SocialMetaInput = {
  locale: string;
  /** Path pubblico, es. `""`, `"/storia"`, `"/links"`. */
  path?: string;
  title: string;
  description: string;
};

/** Canonical, hreflang, Open Graph e Twitter per una pagina pubblica. */
export function buildSocialMetadata({
  locale,
  path = "",
  title,
  description,
}: SocialMetaInput): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const url = localizedPath(locale, path);
  const typedLocale = (
    routing.locales.includes(locale as AppLocale)
      ? locale
      : routing.defaultLocale
  ) as AppLocale;
  const ogLocale = OG_LOCALE[typedLocale];
  const alternateLocale = routing.locales
    .filter((l) => l !== typedLocale)
    .map((l) => OG_LOCALE[l]);

  return {
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: ogLocale,
      alternateLocale,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

/** JSON-LD MusicGroup (home). */
export function musicGroupJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: site.name,
    url: site.domain,
    email: site.email,
    telephone: site.phone,
    description,
    image: `${site.domain}${site.images.logo}`,
    sameAs: [
      site.social.facebook,
      site.social.instagram,
      site.social.youtubeChannel,
      site.social.spotifyArtist,
      site.music.appleMusic,
      site.music.deezer,
      site.music.amazonMusic,
    ],
    genre: ["Folk", "World music", "Occitan folk"],
  };
}
