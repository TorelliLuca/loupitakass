/**
 * Link e media pubblici.
 * Asset statici: public/images/ (hero, membri, brand).
 * Volantini eventi: Vercel Blob via admin.
 * Feed social: Meta Graph API (`src/lib/meta`).
 */
export const site = {
  name: "Lou Pitakass",
  domain: "https://loupitakass.com",
  email: "loupitakass@gmail.com",
  /** Numero pubblico (sezione Contatti). */
  phone: "+39 377 546 3149",
  social: {
    facebook: "https://www.facebook.com/loupitakass",
    instagram: "https://www.instagram.com/lou_pitakass",
    facebookHandle: "@loupitakass",
    instagramHandle: "@lou_pitakass",
    youtubeChannel: "https://www.youtube.com/channel/UChjXnCK0gTGqWGBo9DuKrcQ",
    spotifyArtist: "https://open.spotify.com/artist/1q8jukuzSaKeldXax7IqDj",
  },
  /** Piattaforme di ascolto / distribuzione (landing link-in-bio). */
  music: {
    spotify: "https://open.spotify.com/artist/1q8jukuzSaKeldXax7IqDj",
    appleMusic: "https://music.apple.com/it/artist/lou-pitakass/1470518336",
    youtubeMusic:
      "https://music.youtube.com/channel/UChjXnCK0gTGqWGBo9DuKrcQ",
    deezer: "https://www.deezer.com/artist/68767502",
    amazonMusic:
      "https://music.amazon.it/artists/B07TS9LFKK/lou-pitakass",
  },
  /**
   * Video YouTube singolo (priorità). Se vuoto, si usa la playlist upload del canale.
   */
  youtubeVideoId: "",
  /** Channel ID — per embed della playlist “upload” (UC… → UU…). */
  youtubeChannelId: "UChjXnCK0gTGqWGBo9DuKrcQ",
  /** Path embed Spotify (artist/…, album/…, playlist/…). */
  spotifyEmbedUri: "artist/1q8jukuzSaKeldXax7IqDj",
  images: {
    /** Hero desktop / landscape. */
    hero: "/images/hero.jpg",
    /** Hero mobile / portrait (art-direction). */
    heroMobile: "/images/gallery/2025-verticale.jpg",
    /**
     * Share preview 1200×630 (Open Graph / Twitter).
     * Finché manca l’asset dedicato, `seo.ts` usa la hero.
     */
    og: "/images/hero.jpg",
    /** Emblema con fondo rosso (badge). */
    logo: "/images/brand/logo.png",
    /** Emblema senza fondo — meglio su sfondi scuri. */
    logoTransparent: "/images/brand/logo-transparent.png",
    /** Batteria + bandiera — hero Storia + fondo footer. */
    footer: "/images/brand/footer-drums.jpg",
    /** Stesso asset: hero full-bleed pagina Storia. */
    storyHero: "/images/brand/footer-drums.jpg",
    /** Emblema occitano (croce + stellina) — watermark sezione. */
    occitanEmblem: "/images/brand/occitan-emblem.svg",
    /** Solo croce (uso puntuale / legacy). */
    occitanCross: "/images/brand/occitan-cross.svg",
    /** Solo stella a 7 punte. */
    occitanStar: "/images/brand/occitan-star.svg",
    /** Bandiere lingue (switcher i18n). OC: croce gold su fondo rosso in UI. */
    flags: {
      it: "/images/flags/it.svg",
      fr: "/images/flags/fr.svg",
      en: "/images/flags/en.svg",
      oc: "/images/flags/occitan-cross-gold.svg",
    },
  },
} as const;

/** Src iframe YouTube: video singolo oppure upload del canale. */
export function youtubeEmbedSrc(): string | null {
  if (site.youtubeVideoId) {
    return `https://www.youtube-nocookie.com/embed/${site.youtubeVideoId}`;
  }
  if (site.youtubeChannelId.startsWith("UC")) {
    const uploadsList = `UU${site.youtubeChannelId.slice(2)}`;
    return `https://www.youtube-nocookie.com/embed?listType=playlist&list=${uploadsList}`;
  }
  return null;
}
