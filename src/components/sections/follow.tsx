import { getLocale, getTranslations } from "next-intl/server";
import { getFacebookPosts, getInstagramPosts } from "@/lib/meta/client";
import { site } from "@/lib/site";
import { FadeIn } from "@/components/motion/fade-in";
import { SocialLogoLink } from "@/components/brand/social-icon";
import { Section, SectionHeading } from "@/components/sections/section";
import { SocialLatestPost } from "@/components/sections/social-latest-post";

export async function FollowSection() {
  const t = await getTranslations("Follow");
  const locale = await getLocale();
  const [facebookPosts, instagramPosts] = await Promise.all([
    getFacebookPosts(1),
    getInstagramPosts(1),
  ]);

  const facebookPost = facebookPosts[0] ?? null;
  const instagramPost = instagramPosts[0] ?? null;

  return (
    <Section id="seguici" tone="ink" wide crossSize="sm">
      <SectionHeading title={t("title")} lead={t("lead")} light align="center" />

      <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-2">
        <FadeIn>
          <h3 className="mb-4 flex items-center gap-3 font-display text-3xl text-white">
            <SocialLogoLink
              platform="facebook"
              href={site.social.facebook}
              label={t("openFacebook")}
            />
            {t("facebook")}
          </h3>
          <SocialLatestPost
            post={facebookPost}
            locale={locale}
            handle={site.social.facebookHandle}
            emptyLabel={t("feedUnavailable")}
            openPostLabel={t("openPost")}
            videoLabel={t("video")}
            openOnPlatformLabel={t("openOnFacebook")}
            noCaptionLabel={t("noCaption")}
          />
          <p className="mt-3 text-sm text-white/55">{t("feedHint")}</p>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold tracking-wide underline underline-offset-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            {t("openFacebook")}
          </a>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h3 className="mb-4 flex items-center gap-3 font-display text-3xl text-white">
            <SocialLogoLink
              platform="instagram"
              href={site.social.instagram}
              label={t("openInstagram")}
            />
            {t("instagram")}
          </h3>
          <SocialLatestPost
            post={instagramPost}
            locale={locale}
            handle={site.social.instagramHandle}
            emptyLabel={t("feedUnavailable")}
            openPostLabel={t("openPost")}
            videoLabel={t("video")}
            openOnPlatformLabel={t("openOnInstagram")}
            noCaptionLabel={t("noCaption")}
          />
          <p className="mt-3 text-sm text-white/55">{t("feedHint")}</p>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold tracking-wide underline underline-offset-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            {t("openInstagram")}
          </a>
        </FadeIn>
      </div>
    </Section>
  );
}
