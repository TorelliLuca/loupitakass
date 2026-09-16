import { getLocale, getTranslations } from "next-intl/server";
import type { Album } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { FadeIn } from "@/components/motion/fade-in";
import { AlbumGallery } from "@/components/sections/album-gallery";

export async function AlbumDiscography({ albums }: { albums: Album[] }) {
  if (albums.length === 0) return null;

  const t = await getTranslations("Listen");
  const locale = (await getLocale()) as AppLocale;

  const labels = {
    comingSoon: t("comingSoon"),
    listen: t("listenCta"),
    preSave: t("preSave"),
    showFront: t("showFront"),
    showBack: t("showBack"),
    releaseSingle: t("releaseSingle"),
    releaseAlbum: t("releaseAlbum"),
    showInsert: t("showInsert"),
    hideInsert: t("hideInsert"),
    platforms: {
      spotify: t("platformSpotify"),
      appleMusic: t("platformAppleMusic"),
      youtubeMusic: t("platformYoutubeMusic"),
      bandcamp: t("platformBandcamp"),
      deezer: t("platformDeezer"),
      tidal: t("platformTidal"),
      amazonMusic: t("platformAmazonMusic"),
    },
  };

  return (
    <div className="mb-16 sm:mb-20">
      <FadeIn className="mb-10 max-w-3xl">
        <h3 className="font-display text-3xl text-brand-ink sm:text-4xl">
          {t("discography")}
        </h3>
        <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("discographyLead")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06}>
        <AlbumGallery albums={albums} locale={locale} labels={labels} />
      </FadeIn>
    </div>
  );
}
