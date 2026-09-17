"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SocialPost } from "@/lib/meta/types";
import { SocialLatestPost } from "@/components/sections/social-latest-post";
import { cn } from "@/lib/utils";

type SocialPostGalleryProps = {
  posts: SocialPost[];
  locale: string;
  handle: string;
  emptyLabel: string;
  openPostLabel: string;
  videoLabel: string;
  openOnPlatformLabel: string;
  noCaptionLabel: string;
  galleryLabel: string;
  prevLabel: string;
  nextLabel: string;
};

function wrapIndex(next: number, length: number): number {
  if (length <= 0) return 0;
  return ((next % length) + length) % length;
}

export function SocialPostGallery({
  posts,
  locale,
  handle,
  emptyLabel,
  openPostLabel,
  videoLabel,
  openOnPlatformLabel,
  noCaptionLabel,
  galleryLabel,
  prevLabel,
  nextLabel,
}: SocialPostGalleryProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const syncIndex = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || posts.length === 0) return;
    const slides = root.querySelectorAll<HTMLElement>("[data-social-slide]");
    if (slides.length === 0) return;
    const mid = root.scrollLeft + root.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, i) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setIndex(best);
  }, [posts.length]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    syncIndex();
    root.addEventListener("scroll", syncIndex, { passive: true });
    return () => root.removeEventListener("scroll", syncIndex);
  }, [syncIndex]);

  const scrollToIndex = useCallback(
    (next: number, fromIndex = index) => {
      const root = scrollerRef.current;
      if (!root || posts.length === 0) return;
      const clamped = wrapIndex(next, posts.length);
      const slides = root.querySelectorAll<HTMLElement>("[data-social-slide]");
      const el = slides[clamped];
      if (!el) return;

      const wraps =
        (fromIndex === posts.length - 1 && clamped === 0) ||
        (fromIndex === 0 && clamped === posts.length - 1);

      root.scrollTo({
        left: el.offsetLeft,
        behavior: wraps || reduceMotion ? "auto" : "smooth",
      });
      setIndex(clamped);
    },
    [index, posts.length, reduceMotion],
  );

  if (posts.length === 0) {
    return (
      <SocialLatestPost
        post={null}
        locale={locale}
        handle={handle}
        emptyLabel={emptyLabel}
        openPostLabel={openPostLabel}
        videoLabel={videoLabel}
        openOnPlatformLabel={openOnPlatformLabel}
        noCaptionLabel={noCaptionLabel}
      />
    );
  }

  if (posts.length === 1) {
    return (
      <SocialLatestPost
        post={posts[0]!}
        locale={locale}
        handle={handle}
        emptyLabel={emptyLabel}
        openPostLabel={openPostLabel}
        videoLabel={videoLabel}
        openOnPlatformLabel={openOnPlatformLabel}
        noCaptionLabel={noCaptionLabel}
      />
    );
  }

  return (
    <div className="relative min-w-0 max-w-full">
      <ul
        ref={scrollerRef}
        className="flex w-full min-w-0 list-none snap-x snap-mandatory overflow-x-auto scrollbar-none"
        aria-label={galleryLabel}
      >
        {posts.map((post) => (
          <li
            key={post.id}
            data-social-slide
            className="w-full min-w-0 max-w-full shrink-0 snap-start snap-always basis-full"
          >
            <SocialLatestPost
              post={post}
              locale={locale}
              handle={handle}
              emptyLabel={emptyLabel}
              openPostLabel={openPostLabel}
              videoLabel={videoLabel}
              openOnPlatformLabel={openOnPlatformLabel}
              noCaptionLabel={noCaptionLabel}
            />
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label={prevLabel}
          onClick={() => scrollToIndex(index - 1)}
          className="inline-flex size-9 items-center justify-center text-white opacity-90 transition-opacity hover:opacity-100"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label={galleryLabel}
        >
          {posts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1} / ${posts.length}`}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index
                  ? "bg-brand-brass"
                  : "bg-white/30 hover:bg-white/50",
              )}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={nextLabel}
          onClick={() => scrollToIndex(index + 1)}
          className="inline-flex size-9 items-center justify-center text-white opacity-90 transition-opacity hover:opacity-100"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
