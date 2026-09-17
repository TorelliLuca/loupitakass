import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LinksLanding } from "@/components/links/links-landing";
import { buildSocialMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Links" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    ...buildSocialMetadata({
      locale,
      path: "/links",
      title,
      description,
    }),
  };
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LinksLanding />;
}
