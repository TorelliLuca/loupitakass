import { getTranslations } from "next-intl/server";
import { FadeInItem, Stagger } from "@/components/motion/fade-in";
import { Section, SectionHeading } from "@/components/sections/section";
import { Link } from "@/i18n/navigation";

export async function BioSection() {
  const t = await getTranslations("Bio");
  const paragraphs = t("body").split("\n").filter(Boolean);

  return (
    <Section id="bio" wide>
      <SectionHeading title={t("title")} align="right" />
      <Stagger
        className="ml-auto max-w-2xl space-y-5 text-lg leading-relaxed text-brand-ink/85 sm:text-xl"
        stagger={0.08}
      >
        {paragraphs.map((paragraph) => (
          <FadeInItem key={paragraph.slice(0, 24)} y={10}>
            <p>{paragraph}</p>
          </FadeInItem>
        ))}
        <FadeInItem y={10}>
          <Link href="/storia" className="cta-pill mt-2 inline-flex">
            {t("readStory")}
          </Link>
        </FadeInItem>
      </Stagger>
    </Section>
  );
}
