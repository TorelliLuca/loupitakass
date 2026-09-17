import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SiteLogo } from "@/components/brand/site-logo";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-brand-ink px-6 py-16 text-white">
      <Image
        src={site.images.footer}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[center_35%] opacity-40"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/75 to-brand-ink/55"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 text-center">
        <SiteLogo width={220} className="w-44 sm:w-52" variant="solid" />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link
            href="/storia"
            className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {t("story")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {t("privacy")}
          </Link>
        </nav>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-white/55">
            © {year} {site.name}. {t("rights")}
          </p>
          <p className="text-xs text-white/40">
            {t("designedBy")}{" "}
            <a
              href="https://luca-torelli.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-white/70 hover:underline"
            >
              Luca Torelli
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
