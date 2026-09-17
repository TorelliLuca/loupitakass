import { getLocale, getTranslations } from "next-intl/server";
import type { Member } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import {
  localizedMemberBio,
  localizedMemberRole,
} from "@/lib/public-data";
import { FadeIn, FadeInItem, Stagger } from "@/components/motion/fade-in";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeading } from "@/components/sections/section";
import { MemberFlipCard } from "@/components/sections/member-flip-card";
import { resolveMemberInstrument } from "@/components/sections/instrument-media";

export async function MembersSection({ members }: { members: Member[] }) {
  const t = await getTranslations("Members");
  const locale = (await getLocale()) as AppLocale;

  return (
    <Section id="membri" tone="muted" wide>
      <SectionHeading title={t("title")} lead={t("lead")} />
      <Stagger
        as="ul"
        className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        stagger={0.06}
      >
        {members.map((member, index) => {
          const fullName = `${member.firstName} ${member.lastName}`;
          return (
            <FadeInItem
              key={member.id}
              as="li"
              className="[perspective:1200px]"
              y={12}
            >
              <MemberFlipCard
                fullName={fullName}
                role={localizedMemberRole(member, locale)}
                bio={
                  localizedMemberBio(member, locale) || t("bioFallback")
                }
                photoUrl={member.photoUrl}
                photoAlt={t("photoAlt", { name: fullName })}
                instrument={resolveMemberInstrument(member)}
                watermarkSide={index % 2 === 0 ? "right" : "left"}
              />
            </FadeInItem>
          );
        })}
      </Stagger>
      <FadeIn delay={0.12} className="mt-6 text-center text-xs text-muted-foreground sm:hidden">
        <p>{t("flipHint")}</p>
      </FadeIn>
      <FadeIn delay={0.16} className="mt-8 flex justify-center sm:mt-10">
        <Link href="/storia#gallery" className="cta-pill inline-flex">
          {t("viewGallery")}
        </Link>
      </FadeIn>
    </Section>
  );
}
