import { getImageProps } from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";

const HERO_QUALITY = 70;

export async function HeroSection() {
  const t = await getTranslations("Hero");

  const common = {
    alt: "",
    sizes: "100vw",
    quality: HERO_QUALITY,
    // Eager + high: senza priority getImageProps mette loading="lazy" e rovina l'LCP.
    priority: true,
  } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: site.images.hero,
    width: 1920,
    height: 1280,
  });

  const {
    props: { srcSet: mobileSrcSet, ...mobileImg },
  } = getImageProps({
    ...common,
    src: site.images.heroMobile,
    width: 1080,
    height: 1620,
  });

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-start justify-center overflow-hidden bg-brand-ink text-white lg:items-end"
    >
      {/* Preload art-directed LCP: solo la variante del viewport corrente. */}
      <link
        rel="preload"
        as="image"
        imageSrcSet={mobileSrcSet}
        imageSizes="100vw"
        media="(max-width: 1023px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={desktopSrcSet}
        imageSizes="100vw"
        media="(min-width: 1024px)"
        fetchPriority="high"
      />

      <div
        aria-hidden
        className="absolute inset-0 origin-center scale-105 motion-safe:animate-[ken-burns_12s_ease-out_forwards]"
      >
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet={desktopSrcSet}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- art-direction via getImageProps */}
          <img
            {...mobileImg}
            srcSet={mobileSrcSet}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_42%] lg:object-center"
          />
        </picture>
      </div>

      {/* Mobile: scuro in alto (cielo + titolo); desktop: scuro in basso (come prima). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.72)_0%,rgba(20,16,12,0.35)_38%,rgba(20,16,12,0.5)_100%)] lg:bg-[linear-gradient(180deg,rgba(20,16,12,0.2)_0%,rgba(20,16,12,0.55)_45%,rgba(20,16,12,0.88)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,oklch(0.45_0.08_55_/_0.45),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.07_75_/_0.18),transparent_55%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-10 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] text-center sm:pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] lg:pb-24 lg:pt-20">
        <h1 className="font-display text-[clamp(4rem,16vw,9.5rem)] leading-[0.85] font-medium tracking-tight motion-safe:animate-[fade-rise_1.3s_ease-out_both]">
          Lou&nbsp;Pitakass
        </h1>
        <a
          href="#date"
          className="cta-pill mt-8 motion-safe:animate-[fade-rise_1.3s_ease-out_0.2s_both] lg:mt-10"
        >
          {t("ctaDates")}
        </a>
      </div>
    </section>
  );
}
