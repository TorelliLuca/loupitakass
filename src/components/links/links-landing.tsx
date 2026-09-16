import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import {
  SocialIcon,
  type SocialPlatform,
} from "@/components/brand/social-icon";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { AlbumCoverMedia } from "@/components/sections/album-cover-media";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  albumPlatformLinks,
  localizedAlbumTitle,
  type AlbumPlatformKey,
} from "@/lib/public-data";
import { getLatestPublicAlbum } from "@/lib/queries/public";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

const albumPlatformToSocial: Record<AlbumPlatformKey, SocialPlatform> = {
  spotify: "spotify",
  appleMusic: "appleMusic",
  youtubeMusic: "youtubeMusic",
  bandcamp: "bandcamp",
  deezer: "deezer",
  tidal: "tidal",
  amazonMusic: "amazonMusic",
};

const albumPlatformLabelKey: Record<
  AlbumPlatformKey,
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "bandcamp"
  | "deezer"
  | "tidal"
  | "amazonMusic"
> = {
  spotify: "spotify",
  appleMusic: "appleMusic",
  youtubeMusic: "youtubeMusic",
  bandcamp: "bandcamp",
  deezer: "deezer",
  tidal: "tidal",
  amazonMusic: "amazonMusic",
};

function LinkRow({
  href,
  label,
  platform,
  icon,
  external = true,
  variant = "secondary",
}: {
  href: string;
  label: string;
  platform?: SocialPlatform;
  icon?: ReactNode;
  external?: boolean;
  variant?: "primary" | "secondary";
}) {
  const className = cn(
    "group flex min-h-14 w-full items-center gap-3 px-4 text-left text-base font-semibold tracking-wide transition duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-brass focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink",
    variant === "primary" &&
      "rounded-full bg-brand-brass text-brand-ink hover:brightness-105 hover:scale-[1.01]",
    variant === "secondary" &&
      "rounded-full border border-brand-mist/25 bg-brand-mist/5 text-brand-mist hover:border-brand-brass/60 hover:bg-brand-mist/10",
  );

  const leading =
    icon ??
    (platform ? (
      <SocialIcon platform={platform} className="size-5 opacity-90" />
    ) : null);

  const arrow = (
    <ArrowUpRight
      className="size-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-90"
      aria-hidden
    />
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {leading}
        <span className="flex-1">{label}</span>
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {leading}
      <span className="flex-1">{label}</span>
      {arrow}
    </Link>
  );
}

export async function LinksLanding() {
  const t = await getTranslations("Links");
  const locale = (await getLocale()) as AppLocale;
  const year = new Date().getFullYear();
  const latestAlbum = await getLatestPublicAlbum();
  const albumLinks = latestAlbum ? albumPlatformLinks(latestAlbum) : [];
  const albumTitle = latestAlbum
    ? localizedAlbumTitle(latestAlbum, locale)
    : null;

  const music: {
    href: string;
    labelKey:
      | "spotify"
      | "appleMusic"
      | "youtubeMusic"
      | "deezer"
      | "amazonMusic"
      | "youtube";
    platform: SocialPlatform;
  }[] = [
    {
      href: site.music.spotify,
      labelKey: "spotify",
      platform: "spotify",
    },
    {
      href: site.music.appleMusic,
      labelKey: "appleMusic",
      platform: "appleMusic",
    },
    {
      href: site.music.youtubeMusic,
      labelKey: "youtubeMusic",
      platform: "youtubeMusic",
    },
    {
      href: site.music.deezer,
      labelKey: "deezer",
      platform: "deezer",
    },
    {
      href: site.music.amazonMusic,
      labelKey: "amazonMusic",
      platform: "amazonMusic",
    },
    {
      href: site.social.youtubeChannel,
      labelKey: "youtube",
      platform: "youtube",
    },
  ];

  const socials: {
    href: string;
    platform: "instagram" | "facebook";
    labelKey: "instagram" | "facebook";
  }[] = [
    {
      href: site.social.instagram,
      platform: "instagram",
      labelKey: "instagram",
    },
    {
      href: site.social.facebook,
      platform: "facebook",
      labelKey: "facebook",
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-y-auto overscroll-y-contain bg-brand-ink text-brand-mist",
        "scrollbar-none",
      )}
    >
      <Image
        src={site.images.hero}
        alt=""
        fill
        priority
        className="object-cover object-center opacity-35"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-linear-to-b from-brand-ink/55 via-brand-ink/80 to-brand-ink"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-8 sm:px-5 sm:py-10">
        <div className="mb-6 flex justify-end">
          <LocaleSwitcher className="rounded-full border border-brand-mist/15 bg-brand-ink/40 px-2 py-1 backdrop-blur-sm [&_button]:text-brand-mist/70 [&_button:hover]:bg-brand-mist/10 [&_button:hover]:text-brand-mist [&_button[aria-current=true]]:bg-brand-brass [&_button[aria-current=true]]:text-brand-ink" />
        </div>

        <header className="mb-8 flex flex-col items-center text-center">
          <SiteLogo variant="transparent" width={168} priority />
          <h1 className="mt-5 font-display text-4xl tracking-tight text-brand-mist sm:text-5xl">
            {site.name}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-mist/70">
            {t("tagline")}
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <LinkRow
            href="/"
            label={t("website")}
            external={false}
            variant="primary"
            icon={
              <Image
                src={site.images.logoTransparent}
                alt=""
                width={28}
                height={20}
                className="h-5 w-auto shrink-0"
              />
            }
          />
        </div>

        <section className="mt-9" aria-labelledby="links-follow">
          <h2
            id="links-follow"
            className="mb-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-brass/90"
          >
            {t("followHeading")}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {socials.map((item) => (
              <li key={item.platform}>
                <LinkRow
                  href={item.href}
                  label={t(item.labelKey)}
                  platform={item.platform}
                />
              </li>
            ))}
            <li>
              <LinkRow
                href={`mailto:${site.email}`}
                label={t("email")}
                platform="gmail"
              />
            </li>
          </ul>
        </section>

        <section className="mt-9" aria-labelledby="links-listen">
          <h2
            id="links-listen"
            className="mb-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-brass/90"
          >
            {t("listenHeading")}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {music.map((item) => (
              <li key={item.labelKey}>
                <LinkRow
                  href={item.href}
                  label={t(item.labelKey)}
                  platform={item.platform}
                />
              </li>
            ))}
          </ul>
        </section>

        {latestAlbum && albumTitle && albumLinks.length > 0 ? (
          <section className="mt-9" aria-labelledby="links-new-album">
            <h2
              id="links-new-album"
              className="mb-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-brass/90"
            >
              {t("newAlbumHeading")}
            </h2>
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              <div className="relative aspect-square w-40 overflow-hidden rounded-sm shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] ring-1 ring-brand-mist/15">
                <AlbumCoverMedia
                  src={latestAlbum.coverUrl}
                  alt={albumTitle}
                  priority
                />
              </div>
              <p className="font-display text-2xl tracking-tight text-brand-mist">
                {albumTitle}
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {albumLinks.map((item) => (
                <li key={item.key}>
                  <LinkRow
                    href={item.href}
                    label={t(albumPlatformLabelKey[item.key])}
                    platform={albumPlatformToSocial[item.key]}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-10 pb-2 text-center text-xs text-brand-mist/45">
          {t("footer", { year })}
        </p>
      </div>
    </div>
  );
}
