import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero";
import { DatesSection } from "@/components/sections/dates";
import { ListenSection } from "@/components/sections/listen";
import { FollowSection } from "@/components/sections/follow";
import { BioSection } from "@/components/sections/bio";
import { MembersSection } from "@/components/sections/members";
import { ContactFormSection } from "@/components/sections/contact-form";
import { ContactsSection } from "@/components/sections/contacts";
import { JsonLd } from "@/components/seo/json-ld";
import { ScrollWoodpecker } from "@/components/ui/scroll-woodpecker";
import { getPublicAlbums, getPublicEvents, getPublicMembers } from "@/lib/queries/public";
import { musicGroupJsonLd } from "@/lib/seo";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const [events, members, albums] = await Promise.all([
    getPublicEvents(),
    getPublicMembers(),
    getPublicAlbums(),
  ]);

  return (
    <>
      <JsonLd data={musicGroupJsonLd(tMeta("description"))} />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <DatesSection events={events} />
        <ListenSection albums={albums} />
        <FollowSection />
        <BioSection />
        <MembersSection members={members} />
        <ContactFormSection />
        <ContactsSection />
      </main>
      <SiteFooter />
      <ScrollWoodpecker />
    </>
  );
}
