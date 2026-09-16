import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";

export async function HeroSection() {
  const t = await getTranslations("Hero");

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-end justify-center overflow-hidden bg-brand-ink text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 origin-center scale-105 motion-safe:animate-[ken-burns_12s_ease-out_forwards]"
      >
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet={site.images.hero}
          />
          <Image
            src={site.images.heroMobile}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%] lg:object-center"
          />
        </picture>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.2)_0%,rgba(20,16,12,0.55)_45%,rgba(20,16,12,0.88)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,oklch(0.45_0.08_55_/_0.45),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.07_75_/_0.18),transparent_55%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 pt-16 text-center sm:pb-24 sm:pt-20">
        <h1 className="font-display text-[clamp(4rem,16vw,9.5rem)] leading-[0.85] font-medium tracking-tight motion-safe:animate-[fade-rise_1.3s_ease-out_both]">
          Lou&nbsp;Pitakass
        </h1>
        <a
          href="#date"
          className="cta-pill mt-10 motion-safe:animate-[fade-rise_1.3s_ease-out_0.2s_both]"
        >
          {t("ctaDates")}
        </a>
      </div>
    </section>
  );
}
