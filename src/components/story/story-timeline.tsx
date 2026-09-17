import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { STORY_CHAPTERS } from "@/lib/story";
import { cn } from "@/lib/utils";

export async function StoryTimeline() {
  const t = await getTranslations("Story");

  return (
    <section className="bg-white px-6 py-20 text-brand-ink sm:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-20 sm:space-y-28">
        {STORY_CHAPTERS.map((chapter, index) => {
          const year = t(`${chapter.id}Year`);
          const title = t(`${chapter.id}Title`);
          const body = t(`${chapter.id}Body`);
          const imageLeft = chapter.imageSide === "left";

          return (
            <FadeIn
              key={chapter.id}
              delay={Math.min(index * 0.04, 0.16)}
              className={cn(
                "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
              )}
            >
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden sm:aspect-[5/4]",
                  imageLeft ? "lg:order-1" : "lg:order-2",
                )}
              >
                <Image
                  src={chapter.image}
                  alt={t("chapterImageAlt", { title })}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div
                className={cn(
                  "max-w-xl",
                  imageLeft
                    ? "lg:order-2"
                    : "lg:order-1 lg:ml-auto lg:text-right",
                )}
              >
                <p className="text-sm font-semibold tracking-[0.16em] text-brand-pine uppercase">
                  {year}
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                  {title}
                </h2>
                <p
                  className={cn(
                    "mt-5 text-lg leading-relaxed text-brand-ink/80",
                    !imageLeft && "lg:ml-auto",
                  )}
                >
                  {body}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
