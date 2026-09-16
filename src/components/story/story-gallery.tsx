"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeIn } from "@/components/motion/fade-in";
import {
  STORY_GALLERY,
  type StoryGalleryItem,
  type StoryGalleryTile,
} from "@/lib/story";
import { cn } from "@/lib/utils";

function tileClass(tile: StoryGalleryTile) {
  switch (tile) {
    case "tall":
      return "story-gallery-tile--tall";
    case "land":
      return "story-gallery-tile--land";
    case "wide":
      return "story-gallery-tile--wide";
    case "sq":
      return "story-gallery-tile--sq";
  }
}

function GalleryStrip({
  items,
  onOpen,
  openLabel,
  altFor,
  inert,
}: {
  items: readonly StoryGalleryItem[];
  onOpen: (index: number) => void;
  openLabel: string;
  altFor: (id: string) => string;
  inert?: boolean;
}) {
  return (
    <ul className="story-gallery-masonry" aria-hidden={inert || undefined}>
      {items.map((item, i) => {
        const alt = altFor(item.id);
        return (
          <li
            key={`${inert ? "dup" : "main"}-${item.id}`}
            className={cn("story-gallery-tile", tileClass(item.tile))}
          >
            <button
              type="button"
              tabIndex={inert ? -1 : 0}
              onClick={() => onOpen(i)}
              className="group absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              aria-label={`${openLabel}: ${alt}`}
            >
              <Image
                src={item.src}
                alt={inert ? "" : alt}
                fill
                sizes="(max-width: 640px) 55vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-brand-ink/0 transition-colors duration-300 group-hover:bg-brand-ink/15"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function StoryGallery() {
  const t = useTranslations("Story");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((current) =>
      current === 0 ? STORY_GALLERY.length - 1 : current - 1,
    );
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) =>
      current === STORY_GALLERY.length - 1 ? 0 : current + 1,
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  const current = STORY_GALLERY[index];
  const currentAlt = t(`galleryAlt_${current.id}`);
  const running = !open && !paused;

  return (
    <section
      id="gallery"
      className="overflow-x-clip bg-secondary py-20 text-brand-ink sm:py-28"
    >
      <div className="mx-auto mb-12 max-w-6xl px-6 sm:mb-14">
        <FadeIn className="max-w-2xl">
          <header>
            <h2 className="display-title">{t("galleryTitle")}</h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              {t("galleryLead")}
            </p>
          </header>
        </FadeIn>
      </div>

      <div
        className="relative"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-secondary to-transparent sm:w-16"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-secondary to-transparent sm:w-16"
        />

        <div className="overflow-hidden px-6">
          <div
            className={cn(
              "story-gallery-marquee",
              running && "story-gallery-marquee--running",
            )}
          >
            <GalleryStrip
              items={STORY_GALLERY}
              onOpen={openAt}
              openLabel={t("galleryOpen")}
              altFor={(id) => t(`galleryAlt_${id}`)}
            />
            <GalleryStrip
              items={STORY_GALLERY}
              onOpen={openAt}
              openLabel={t("galleryOpen")}
              altFor={(id) => t(`galleryAlt_${id}`)}
              inert
            />
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[min(94vh,56rem)] w-full max-w-[min(94vw,56rem)] overflow-hidden border-0 bg-brand-ink p-0 text-white ring-0 sm:max-w-[min(94vw,56rem)]"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{currentAlt}</DialogTitle>

          <div className="relative flex min-h-[min(70vh,40rem)] items-center justify-center bg-brand-ink p-3 sm:p-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox: dimensioni variabili */}
            <img
              src={current.src}
              alt={currentAlt}
              className="max-h-[min(78vh,48rem)] w-auto max-w-full object-contain"
            />

            <DialogClose
              className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label={t("galleryClose")}
            >
              <XIcon className="size-5" />
            </DialogClose>

            <button
              type="button"
              onClick={goPrev}
              className="absolute top-1/2 left-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
              aria-label={t("galleryPrev")}
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
              aria-label={t("galleryNext")}
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
