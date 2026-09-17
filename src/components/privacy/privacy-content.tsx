import { getTranslations } from "next-intl/server";
import { SiteLogo } from "@/components/brand/site-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SiteFooter } from "@/components/layout/site-footer";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

const SECTIONS = [
  "controller",
  "data",
  "purpose",
  "recipients",
  "retention",
  "rights",
  "cookies",
] as const;

export async function PrivacyContent() {
  const t = await getTranslations("Privacy");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-ink/10 bg-white/95 px-6 py-5 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link href="/" aria-label={site.name}>
            <SiteLogo width={180} className="w-36 sm:w-44" />
          </Link>
          <LocaleSwitcher tone="ink" />
        </div>
      </header>

      <main className="flex-1 px-6 py-12 sm:py-16">
        <article className="mx-auto w-full max-w-3xl">
          <h1 className="font-display text-4xl tracking-tight text-brand-ink sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-brand-ink/55">{t("updated")}</p>
          <p className="mt-8 text-base leading-relaxed text-brand-ink/80">
            {t("intro", {
              name: site.name,
              domain: "loupitakass.com",
            })}
          </p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((key) => (
              <section key={key}>
                <h2 className="font-display text-2xl text-brand-ink">
                  {t(`${key}Title`)}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-brand-ink/80">
                  {t(`${key}Body`, { email: site.email, name: site.name })}
                </p>
              </section>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
