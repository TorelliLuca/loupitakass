"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  instrumentPhoto,
  type InstrumentKey,
} from "@/components/sections/instrument-media";

export type MemberCardProps = {
  fullName: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoAlt: string;
  instrument?: InstrumentKey | null;
};

export function MemberFlipCard({
  fullName,
  role,
  bio,
  photoUrl,
  photoAlt,
  instrument = null,
}: MemberCardProps) {
  const t = useTranslations("Members");
  const [flipped, setFlipped] = useState(false);
  const initials = fullName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  const instrumentSrc = instrument ? instrumentPhoto[instrument] : null;

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

        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-brand-ink px-5 py-6 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {instrumentSrc ? (
            <div className="absolute inset-0" aria-hidden>
              <Image
                src={instrumentSrc}
                alt=""
                fill
                className={cn(
                  "object-cover opacity-55 transition-opacity duration-700 ease-out",
                  "group-hover:opacity-65",
                  flipped && "opacity-65",
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/45 to-brand-ink/25" />
            </div>
          ) : null}

          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-[0.28em] text-brand-brass uppercase">
              {role}
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight">
              {fullName}
            </h3>
          </div>
          <p className="relative z-10 text-sm leading-relaxed text-white/85 sm:text-base">
            {bio}
          </p>
        </div>
      </div>
    </button>
  );
}
