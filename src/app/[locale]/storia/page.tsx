import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoryGallery } from "@/components/story/story-gallery";
import { StoryHero } from "@/components/story/story-hero";
import { StoryTimeline } from "@/components/story/story-timeline";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/lib/site";

function storyUrl(locale: string): string {
  if (locale === routing.defaultLocale) {
    return `${site.domain}/storia`;
  }
  return `${site.domain}/${locale}/storia`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Story" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: storyUrl(locale),
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  return (
    <>
      <StoryHero />
      <main className="flex-1">
        <StoryTimeline />
        <StoryGallery />
      </main>
      <SiteFooter />
    </>
  );
}
