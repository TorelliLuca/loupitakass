import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NotFoundWoodpecker } from "@/components/sections/not-found-woodpecker";

export async function NotFoundView() {
  const t = await getTranslations("NotFound");

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,color-mix(in_oklch,var(--brand-brass)_28%,transparent),transparent_58%),linear-gradient(180deg,color-mix(in_oklch,var(--brand-mist)_80%,white)_0%,var(--background)_55%,color-mix(in_oklch,var(--brand-pine)_8%,var(--background))_100%)]"
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <NotFoundWoodpecker />

        <h1 className="mt-8 font-display text-[clamp(1.65rem,5.5vw,2.75rem)] leading-[1.15] font-medium tracking-tight text-brand-ink text-balance">
          {t("line")}
        </h1>

        <Link href="/" className="cta-pill mt-8">
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
