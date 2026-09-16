import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { FadeIn } from "@/components/motion/fade-in";
import { SocialIcon } from "@/components/brand/social-icon";
import { Section, SectionHeading } from "@/components/sections/section";

export async function ContactsSection() {
  const t = await getTranslations("Contacts");
  const follow = await getTranslations("Follow");

  return (
    <Section id="contatti" tone="muted" wide>
      <SectionHeading title={t("title")} lead={t("lead")} />
      <dl className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        <FadeIn>
          <dt className="text-xs font-semibold tracking-[0.28em] text-brand-ink/45 uppercase">
            {t("email")}
          </dt>
          <dd className="mt-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-block font-display text-2xl text-brand-ink underline-offset-4 transition-transform duration-300 hover:scale-[1.02] hover:underline sm:text-3xl"
            >
              {site.email}
            </a>
          </dd>
        </FadeIn>
        <FadeIn delay={0.06}>
          <dt className="text-xs font-semibold tracking-[0.28em] text-brand-ink/45 uppercase">
            {t("phone")}
          </dt>
          <dd className="mt-3">
            <a
              href={`tel:${site.phone.replace(/\s+/g, "")}`}
              className="inline-block font-display text-2xl text-brand-ink underline-offset-4 transition-transform duration-300 hover:scale-[1.02] hover:underline sm:text-3xl"
            >
              {site.phone}
            </a>
          </dd>
        </FadeIn>
        <FadeIn delay={0.12}>
          <dt className="text-xs font-semibold tracking-[0.28em] text-brand-ink/45 uppercase">
            {t("social")}
          </dt>
          <dd className="mt-3 flex flex-col gap-2">
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-display text-2xl text-brand-ink underline-offset-4 transition-transform duration-300 hover:scale-[1.02] hover:underline sm:text-3xl"
            >
              <SocialIcon platform="facebook" className="size-6" />
              {follow("facebook")}
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-display text-2xl text-brand-ink underline-offset-4 transition-transform duration-300 hover:scale-[1.02] hover:underline sm:text-3xl"
            >
              <SocialIcon platform="instagram" className="size-6" />
              {follow("instagram")}
            </a>
          </dd>
        </FadeIn>
      </dl>
    </Section>
  );
}
