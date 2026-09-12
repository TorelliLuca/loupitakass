import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.76_0.11_80_/_0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.38_0.06_155_/_0.18),_transparent_50%)]"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-end px-6 pt-6">
        <LocaleSwitcher />
      </header>
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <p className="font-display text-sm font-medium tracking-[0.2em] text-brand-pine uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-5xl leading-none font-semibold tracking-tight text-brand-ink sm:text-7xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("lead")}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#setup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {t("ctaStack")}
          </Link>
          <a
            href="https://loupitakass.com"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            loupitakass.com
          </a>
        </div>
      </section>
      <section
        id="setup"
        className="relative z-10 border-t border-border bg-card/80 px-6 py-12 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-3xl space-y-3 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">
            {t("decisionsTitle")}
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>{t("decisionAuth")}</li>
            <li>{t("decisionMedia")}</li>
            <li>{t("decisionDomain")}</li>
            <li>{t("decisionLocales")}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
