"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Play } from "lucide-react";
import type { Album } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import {
  albumPlatformLinks,
  isUpcomingAlbum,
  localizedAlbumTitle,
  type AlbumPlatformKey,
} from "@/lib/public-data";
import { AlbumCoverMedia } from "@/components/sections/album-cover-media";
import { getAlbumReleaseType } from "@/lib/admin/album-release-type";
import { formatDurationSec } from "@/lib/duration";
import { cn } from "@/lib/utils";

/** Pin leggero (l’SVG originale è un PNG enorme in base64). */
const PICCHIO_ROSSO = "/images/brand/picchio-rosso-pin.png";

type PlatformLabels = Record<AlbumPlatformKey, string>;

export type AlbumSleeveLabels = {
  comingSoon: string;
  listen: string;
  preSave: string;
  showFront: string;
  showBack: string;
  releaseSingle: string;
  releaseAlbum: string;
  showInsert: string;
  hideInsert: string;
  platforms: PlatformLabels;
};

type InsertPhase = "closed" | "opening" | "open" | "closing";

function prefersFineHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Altezze waveform decorative, stabili per album id. */
function waveformBars(seed: string, count = 28): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    bars.push(0.22 + ((h >>> 0) % 78) / 100);
  }
  return bars;
}

function formatReleaseDate(isoDate: string, locale: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat(locale === "oc" ? "fr" : locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatInsertDate(isoDate: string, locale: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat(locale === "oc" ? "fr" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function releaseYear(isoDate: string) {
  return isoDate.slice(0, 4);
}

export function AlbumSleeve({
  album,
  locale,
  labels,
  insertOpen = false,
  onInsertOpenChange,
}: {
  album: Album;
  locale: AppLocale;
  labels: AlbumSleeveLabels;
  /** Controllato dalla gallery: un solo singolo aperto alla volta. */
  insertOpen?: boolean;
  onInsertOpenChange?: (open: boolean) => void;
}) {
  const title = localizedAlbumTitle(album, locale);
  const upcoming = isUpcomingAlbum(album);
  const platforms = albumPlatformLinks(album);
  const primaryHref = platforms[0]?.href ?? null;
  const isSingle = getAlbumReleaseType(album) === "single";
  const hasBack = !isSingle && Boolean(album.coverBackUrl);
  const discUrl = !isSingle ? album.discUrl : null;
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState<InsertPhase>("closed");
  const phaseRef = useRef<InsertPhase>("closed");
  const labelId = useId();
  const bars = isSingle ? waveformBars(album.id) : [];
  const insertVisible = phase !== "closed";

  function setInsertPhase(next: InsertPhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function openInsert() {
    const current = phaseRef.current;
    if (current === "opening" || current === "open") return;
    if (prefersReducedMotion()) {
      setInsertPhase("open");
      onInsertOpenChange?.(true);
      return;
    }
    setInsertPhase("opening");
    onInsertOpenChange?.(true);
  }

  function closeInsert() {
    const current = phaseRef.current;
    if (current === "closing" || current === "closed") return;
    if (prefersReducedMotion()) {
      setInsertPhase("closed");
      onInsertOpenChange?.(false);
      return;
    }
    setInsertPhase("closing");
  }

  // Sync da gallery (click fuori / cambio slide): chiudi con reverse.
  useEffect(() => {
    if (!isSingle) return;
    if (!insertOpen && (phaseRef.current === "open" || phaseRef.current === "opening")) {
      closeInsert();
    }
  }, [insertOpen, isSingle]);

  function onInsertAnimEnd(e: AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const name = e.animationName;
    if (name.includes("single-insert-pull-front") && phaseRef.current === "opening") {
      setInsertPhase("open");
      return;
    }
    if (name.includes("single-insert-tuck-back") && phaseRef.current === "closing") {
      setInsertPhase("closed");
      onInsertOpenChange?.(false);
    }
  }

  function toggleInsert() {
    const current = phaseRef.current;
    if (current === "open" || current === "opening") closeInsert();
    else openInsert();
  }

  function onSleeveClick(e: MouseEvent) {
    e.stopPropagation();

    if (isSingle) {
      // Desktop con hover: solo mouseenter/leave (il click annullerebbe l’apertura).
      if (prefersFineHover()) return;
      toggleInsert();
      return;
    }
    if (!hasBack) return;
    setFlipped((v) => !v);
  }

  return (
    <article className="min-w-0">
      <div
        className={cn(
          "album-sleeve group outline-none",
          isSingle && "album-sleeve--single",
          isSingle && phase === "opening" && "album-sleeve--opening",
          isSingle && phase === "open" && "album-sleeve--open",
          isSingle && phase === "closing" && "album-sleeve--closing",
          flipped && "album-sleeve--flipped",
          (hasBack || isSingle) && "album-sleeve--flippable",
        )}
        tabIndex={hasBack || isSingle ? 0 : undefined}
        role={hasBack || isSingle ? "button" : undefined}
        aria-pressed={
          isSingle ? insertVisible : hasBack ? flipped : undefined
        }
        aria-labelledby={labelId}
        aria-label={
          isSingle
            ? `${title}. ${insertVisible ? labels.hideInsert : labels.showInsert}`
            : hasBack
              ? flipped
                ? `${title}. ${labels.showFront}`
                : `${title}. ${labels.showBack}`
              : undefined
        }
        onClick={onSleeveClick}
        onMouseEnter={() => {
          if (!isSingle || !prefersFineHover()) return;
          openInsert();
        }}
        onMouseLeave={() => {
          if (!isSingle || !prefersFineHover()) return;
          closeInsert();
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (!isSingle && !hasBack) return;
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          e.stopPropagation();
          if (isSingle) toggleInsert();
          else if (hasBack) setFlipped((v) => !v);
        }}
      >
        {isSingle ? (
          <div
            className="album-sleeve__insert"
            aria-hidden={!insertVisible}
            onAnimationEnd={onInsertAnimEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PICCHIO_ROSSO}
              alt=""
              className="album-sleeve__insert-mark"
              draggable={false}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            <div className="album-sleeve__insert-inner">
              <p className="album-sleeve__insert-kicker">
                {labels.releaseSingle}
              </p>
              <div className="album-sleeve__waveform" aria-hidden>
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className="album-sleeve__wave-bar"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <p className="album-sleeve__insert-meta">
                <span>{formatInsertDate(album.releaseDate, locale)}</span>
                {album.durationSec != null && album.durationSec > 0 ? (
                  <>
                    <span className="album-sleeve__insert-dot" aria-hidden>
                      ·
                    </span>
                    <span className="album-sleeve__insert-duration">
                      {formatDurationSec(album.durationSec)}
                    </span>
                  </>
                ) : null}
              </p>
              {primaryHref ? (
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="album-sleeve__insert-play"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="size-3.5 fill-current" aria-hidden />
                  <span>{upcoming ? labels.preSave : labels.listen}</span>
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "album-sleeve__disc",
              discUrl && "album-sleeve__disc--image",
            )}
            aria-hidden
          >
            <div className="album-sleeve__disc-spin">
              {discUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={discUrl}
                  alt=""
                  className="album-sleeve__disc-img"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              ) : null}
            </div>
          </div>
        )}
        <div className="album-sleeve__flipper">
          <div className="album-sleeve__face album-sleeve__face--front">
            <AlbumCoverMedia src={album.coverUrl} alt={title} />
          </div>
          {hasBack ? (
            <div className="album-sleeve__face album-sleeve__face--back">
              <AlbumCoverMedia
                src={album.coverBackUrl}
                alt={`${title} — ${labels.showBack}`}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3
          id={labelId}
          className="font-display text-xl leading-tight text-brand-ink sm:text-2xl"
        >
          {title}
        </h3>

        <p className="text-sm text-muted-foreground">
          <span
            className={cn(
              "font-semibold tracking-wide uppercase",
              isSingle ? "text-brand-brass" : "text-brand-ink/55",
            )}
          >
            {isSingle ? labels.releaseSingle : labels.releaseAlbum}
          </span>
          <span className="mx-2 text-brand-ink/25" aria-hidden>
            ·
          </span>
          {upcoming ? (
            <>
              <span className="font-semibold tracking-wide text-brand-pine uppercase">
                {labels.comingSoon}
              </span>
              <span className="mx-2 text-brand-ink/25" aria-hidden>
                ·
              </span>
              <span>{formatReleaseDate(album.releaseDate, locale)}</span>
            </>
          ) : (
            <span className="font-semibold tracking-wide text-brand-ink/70">
              {releaseYear(album.releaseDate)}
            </span>
          )}
        </p>

        {isSingle ? (
          <p className="text-xs text-muted-foreground">{labels.showInsert}</p>
        ) : null}

        {hasBack ? (
          <p className="text-xs text-muted-foreground">
            {flipped ? labels.showFront : labels.showBack}
          </p>
        ) : null}

        {primaryHref ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold tracking-wide text-brand-ink underline underline-offset-4 transition-opacity hover:opacity-70"
            onClick={(e) => e.stopPropagation()}
          >
            {upcoming ? labels.preSave : labels.listen}
          </a>
        ) : null}

        {platforms.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {platforms.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium tracking-wide text-brand-ink/55 underline-offset-2 transition-colors hover:text-brand-ink hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {labels.platforms[key]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
