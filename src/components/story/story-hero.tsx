import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SiteLogo } from "@/components/brand/site-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export async function StoryHero() {
  const t = await getTranslations("Story");

  return (
    <section className="relative flex min-h-[70svh] items-end overflow-hidden bg-brand-ink text-white sm:min-h-[78svh]">
      <div
        aria-hidden
        className="absolute inset-0 origin-center scale-105 motion-safe:animate-[ken-burns_14s_ease-out_forwards]"
      >
        <Image
          src={site.images.storyHero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.45)_0%,rgba(20,16,12,0.55)_40%,rgba(20,16,12,0.92)_100%)]"
      />

      <header className="absolute inset-x-0 top-0 z-20 px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <Link href="/" aria-label={site.name}>
            <SiteLogo width={180} className="w-36 sm:w-44" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline sm:inline"
            >
              {t("backHome")}
            </Link>
            <LocaleSwitcher className="[&_button]:text-white/70 [&_button:hover]:bg-white/10 [&_button:hover]:text-white [&_button[aria-current=true]]:bg-brand-brass [&_button[aria-current=true]]:text-brand-ink" />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-28 sm:pb-20 sm:pt-32">
        <p className="text-sm font-semibold tracking-[0.18em] text-brand-brass uppercase motion-safe:animate-[fade-rise_1.1s_ease-out_both]">
          Lou Pitakass
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.9] font-medium tracking-tight motion-safe:animate-[fade-rise_1.2s_ease-out_0.08s_both]">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg motion-safe:animate-[fade-rise_1.2s_ease-out_0.16s_both]">
          {t("lead")}
        </p>
      </div>
    </section>
  );
}
