"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  instrumentIcon,
  resolveWatermarkLayout,
  type InstrumentKey,
} from "@/components/sections/instrument-media";

export type MemberCardProps = {
  fullName: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoAlt: string;
  instrument?: InstrumentKey | null;
  /** Alterna filigrana sinistra / destra nella griglia. */
  watermarkSide?: "left" | "right";
};

export function MemberFlipCard({
  fullName,
  role,
  bio,
  photoUrl,
  photoAlt,
  instrument = null,
  watermarkSide = "right",
}: MemberCardProps) {
  const t = useTranslations("Members");
  const [flipped, setFlipped] = useState(false);
  const initials = fullName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  const iconSrc = instrument ? instrumentIcon[instrument] : null;
  const watermark = resolveWatermarkLayout(instrument);
  const sideAlign =
    watermarkSide === "right" ? "text-left" : "text-right";
  const headerAlign =
    watermark.headerAlign === "left"
      ? "text-left"
      : watermark.headerAlign === "right"
        ? "text-right"
        : sideAlign;
  const bioAlign =
    watermark.bioAlign === "left"
      ? "text-left"
      : watermark.bioAlign === "right"
        ? "text-right"
        : sideAlign;
  const headerClearance =
    watermarkSide === "right"
      ? watermark.headerClearance.right
      : watermark.headerClearance.left;
  const bioClearance =
    watermarkSide === "right"
      ? watermark.bioClearance.right
      : watermark.bioClearance.left;

  return (
    <button
      type="button"
      className="group relative block aspect-[3/4] w-full cursor-pointer border-0 bg-transparent p-0 text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-brass focus-visible:ring-offset-2"
      aria-pressed={flipped}
      aria-label={
        flipped
          ? t("flipBack", { name: fullName })
          : t("flipShow", { name: fullName })
      }
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        className={cn(
          "relative size-full transition-transform duration-500 ease-out [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover:[transform:rotateY(180deg)]",
        )}
      >
        <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={photoAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-[linear-gradient(160deg,oklch(0.78_0.07_75_/_0.45),oklch(0.14_0.015_50_/_0.75))]"
              aria-hidden
            >
              <span className="font-display text-6xl text-white/45">
                {initials}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/35 to-transparent px-4 pt-16 pb-4">
            <p className="font-display text-2xl text-white sm:text-3xl">
              {fullName}
            </p>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-[color-mix(in_oklch,var(--brand-mist)_88%,var(--brand-brass))] px-5 py-6 text-brand-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {iconSrc ? (
            <div
              className={cn(
                "pointer-events-none absolute -bottom-[14%] opacity-0 transition-opacity duration-500 ease-out",
                watermark.box,
                watermarkSide === "right"
                  ? watermark.insetRight
                  : watermark.insetLeft,
                "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-55",
                flipped && "opacity-55",
              )}
              /* translateZ: evita bug Blink/WebKit — PNG con alfa diventano bianche in preserve-3d */
              style={{ transform: "translateZ(0.1px)" }}
              aria-hidden
            >
              <div
                className={cn(
                  "size-full scale-90 bg-contain bg-no-repeat transition-transform duration-500 ease-out",
                  watermarkSide === "right"
                    ? "origin-bottom-right bg-right"
                    : "origin-bottom-left bg-left",
                  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-100",
                  flipped && "scale-100",
                )}
                style={{ backgroundImage: `url(${iconSrc})` }}
              />
            </div>
          ) : null}

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color-mix(in_oklch,var(--brand-mist)_92%,var(--brand-brass))] via-[color-mix(in_oklch,var(--brand-mist)_70%,transparent)] to-transparent"
            aria-hidden
          />

          <div className={cn("relative z-10 w-full", headerAlign, headerClearance)}>
            <p className="text-xs font-semibold tracking-[0.28em] text-brand-pine uppercase">
              {role}
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight text-brand-ink">
              {fullName}
            </h3>
          </div>
          <p
            className={cn(
              "relative z-10 w-full text-sm leading-relaxed text-brand-ink/80 sm:text-base",
              bioAlign,
              bioClearance,
            )}
          >
            {bio}
          </p>
        </div>
      </div>
    </button>
  );
}
