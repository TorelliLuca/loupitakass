import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyContent } from "@/components/privacy/privacy-content";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/lib/site";

function privacyUrl(locale: string): string {
  if (locale === routing.defaultLocale) {
    return `${site.domain}/privacy`;
  }
  return `${site.domain}/${locale}/privacy`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: privacyUrl(locale),
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  return <PrivacyContent />;
}
