import { getTranslations } from "next-intl/server";
import type { Album } from "@/lib/db/schema";
import { site, youtubeEmbedSrc } from "@/lib/site";
import { FadeIn } from "@/components/motion/fade-in";
import { SocialLogoLink } from "@/components/brand/social-icon";
import { AlbumDiscography } from "@/components/sections/album-discography";
import { Section, SectionHeading } from "@/components/sections/section";

export async function ListenSection({ albums }: { albums: Album[] }) {
  const t = await getTranslations("Listen");
  const youtubeSrc = youtubeEmbedSrc();
  const hasSpotify = Boolean(site.spotifyEmbedUri);

  return (
    <Section id="ascoltaci" wide crossSize="sm" className="overflow-visible">
      <SectionHeading title={t("title")} lead={t("lead")} />

      <AlbumDiscography albums={albums} />

      <div className="grid gap-14 lg:grid-cols-2">
        <FadeIn>
          <h3 className="mb-4 flex items-center gap-3 font-display text-3xl text-brand-ink">
            <SocialLogoLink
              platform="youtube"
              href={site.social.youtubeChannel}
              label={t("openYoutube")}
            />
            {t("youtube")}
          </h3>
          {youtubeSrc ? (
            <div className="h-[352px] overflow-hidden bg-brand-ink">
              <iframe
                title={t("youtube")}
                src={youtubeSrc}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-[352px] items-center justify-center bg-secondary px-6 text-center text-sm text-muted-foreground">
              {t("youtubePlaceholder")}
            </div>
          )}
          <a
            href={site.social.youtubeChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm font-semibold tracking-wide underline underline-offset-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            {t("openYoutube")}
          </a>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h3 className="mb-4 flex items-center gap-3 font-display text-3xl text-brand-ink">
            <SocialLogoLink
              platform="spotify"
              href={site.social.spotifyArtist}
              label={t("openSpotify")}
            />
            {t("spotify")}
          </h3>
          {hasSpotify ? (
            <div className="h-[352px] overflow-hidden bg-brand-ink">
              <iframe
                title={t("spotify")}
                src={`https://open.spotify.com/embed/${site.spotifyEmbedUri}?utm_source=generator&theme=0`}
                className="size-full"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-[352px] items-center justify-center bg-secondary px-6 text-center text-sm text-muted-foreground">
              {t("spotifyPlaceholder")}
            </div>
          )}
          <a
            href={site.social.spotifyArtist}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm font-semibold tracking-wide underline underline-offset-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            {t("openSpotify")}
          </a>
        </FadeIn>
      </div>
    </Section>
  );
}
