import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoryGallery } from "@/components/story/story-gallery";
import { StoryHero } from "@/components/story/story-hero";
import { StoryTimeline } from "@/components/story/story-timeline";
import { ScrollWoodpecker } from "@/components/ui/scroll-woodpecker";
import { type AppLocale } from "@/i18n/routing";
import { buildSocialMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Story" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    ...buildSocialMetadata({
      locale,
      path: "/storia",
      title,
      description,
    }),
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
      <ScrollWoodpecker />
    </>
  );
}
