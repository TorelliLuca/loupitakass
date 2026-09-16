"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type { Album } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import {
  AlbumSleeve,
  type AlbumSleeveLabels,
} from "@/components/sections/album-sleeve";
import { cn } from "@/lib/utils";

const AUTO_MS = 4500;
const RESUME_MS = 8000;

type AlbumGalleryProps = {
  albums: Album[];
  locale: AppLocale;
  labels: AlbumSleeveLabels;
};

export function AlbumGallery({ albums, locale, labels }: AlbumGalleryProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [needsDots, setNeedsDots] = useState(false);
  /** Richiesta di apertura (false = chiudi con reverse). */
  const [openInsertId, setOpenInsertId] = useState<string | null>(null);
  /** Slide in primo piano finché l’animazione di chiusura non finisce. */
  const [frontInsertId, setFrontInsertId] = useState<string | null>(null);

  const measureOverflow = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    setNeedsDots(root.scrollWidth > root.clientWidth + 4);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    measureOverflow();
    const ro = new ResizeObserver(() => measureOverflow());
    ro.observe(root);
    window.addEventListener("resize", measureOverflow);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureOverflow);
    };
  }, [albums.length, measureOverflow]);

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const scrollToIndex = useCallback(
    (next: number) => {
      const root = scrollerRef.current;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>("[data-album-slide]");
      const el = items[next];
      if (!el) return;
      const left = el.offsetLeft - (root.clientWidth - el.offsetWidth) / 2;
      root.scrollTo({
        left: Math.max(0, left),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      setIndex(next);
    },
    [reduceMotion],
  );

  const advance = useEffectEvent(() => {
    if (albums.length <= 1) return;
    const next = (index + 1) % albums.length;
    scrollToIndex(next);
  });

  useEffect(() => {
    // Non auto-scrollare mentre un inserto è aperto.
    if (paused || openInsertId || albums.length <= 1 || reduceMotion || !needsDots)
      return;
    const id = window.setInterval(() => advance(), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, openInsertId, albums.length, index, reduceMotion, needsDots]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const onScroll = () => {
      const items = [
        ...root.querySelectorAll<HTMLElement>("[data-album-slide]"),
      ];
      if (items.length === 0) return;
      const mid = root.scrollLeft + root.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      items.forEach((el, i) => {
        const center = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setIndex(best);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  // Chiudi inserto se si clicca fuori dalla gallery (capture: dopo il click sulla sleeve).
  useEffect(() => {
    if (!openInsertId) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = scrollerRef.current?.closest(".album-gallery");
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setOpenInsertId(null);
      }
    };
    // bubble phase: la sleeve fa stopPropagation sull’apertura
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openInsertId]);

  return (
    <div
      className="album-gallery -mx-6 sm:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onPointerDown={pauseTemporarily}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "album-gallery__track flex list-none gap-10 overflow-x-auto px-6 pb-10 pt-5 sm:gap-12 sm:px-2",
          "snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        aria-label="Discografia"
      >
        {albums.map((album) => {
          const isOpen = openInsertId === album.id;
          const isFront = frontInsertId === album.id;
          return (
            <li
              key={album.id}
              data-album-slide
              className={cn(
                "album-gallery__slide w-[min(72vw,17.5rem)] shrink-0 snap-center sm:w-[min(42vw,18.5rem)] md:w-[min(30vw,19rem)]",
                isFront && "album-gallery__slide--active",
              )}
            >
              <AlbumSleeve
                album={album}
                locale={locale}
                labels={labels}
                insertOpen={isOpen}
                onInsertOpenChange={(open) => {
                  if (open) {
                    setOpenInsertId(album.id);
                    setFrontInsertId(album.id);
                    pauseTemporarily();
                  } else {
                    setOpenInsertId((id) => (id === album.id ? null : id));
                    setFrontInsertId((id) => (id === album.id ? null : id));
                  }
                }}
              />
            </li>
          );
        })}
      </ul>

      {needsDots && albums.length > 1 ? (
        <div
          className="mt-1 flex items-center justify-center gap-2 px-6 sm:px-0"
          role="tablist"
          aria-label="Album"
        >
          {albums.map((album, i) => (
            <button
              key={album.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Album ${i + 1}`}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === index
                  ? "bg-brand-ink"
                  : "bg-brand-ink/25 hover:bg-brand-ink/45",
              )}
              onClick={() => {
                pauseTemporarily();
                setOpenInsertId(null);
                scrollToIndex(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
