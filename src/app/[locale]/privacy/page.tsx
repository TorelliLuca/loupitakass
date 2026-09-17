import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyContent } from "@/components/privacy/privacy-content";
import { type AppLocale } from "@/i18n/routing";
import { buildSocialMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    ...buildSocialMetadata({
      locale,
      path: "/privacy",
      title,
      description,
    }),
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
