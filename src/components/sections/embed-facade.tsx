"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  SocialIcon,
  type SocialPlatform,
} from "@/components/brand/social-icon";
import { cn } from "@/lib/utils";

type EmbedFacadeProps = {
  platform: Extract<SocialPlatform, "youtube" | "spotify">;
  title: string;
  src: string;
  posterSrc: string;
  loadLabel: string;
  allow: string;
  allowFullScreen?: boolean;
};

function withAutoplay(src: string) {
  try {
    const url = new URL(src);
    url.searchParams.set("autoplay", "1");
    return url.toString();
  } catch {
    return src;
  }
}

export function EmbedFacade({
  platform,
  title,
  src,
  posterSrc,
  loadLabel,
  allow,
  allowFullScreen,
}: EmbedFacadeProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="h-88 overflow-hidden bg-brand-ink">
        <iframe
          title={title}
          src={withAutoplay(src)}
          className="size-full"
          allow={allow}
          allowFullScreen={allowFullScreen}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={loadLabel}
      className={cn(
        "group relative flex h-88 w-full cursor-pointer overflow-hidden bg-brand-ink text-left text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-brass focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03] group-hover:opacity-80"
      />
      <span
        className="absolute inset-0 bg-linear-to-t from-brand-ink/85 via-brand-ink/35 to-brand-ink/20"
        aria-hidden
      />
      <span className="relative z-10 flex size-full flex-col items-center justify-center gap-4 px-6">
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-full text-brand-ink shadow-lg transition-transform duration-300 group-hover:scale-105",
            platform === "spotify" ? "bg-[#1DB954]" : "bg-white",
          )}
          aria-hidden
        >
          <Play className="size-7 translate-x-0.5 fill-current" />
        </span>
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <SocialIcon platform={platform} className="size-5" />
          {loadLabel}
        </span>
      </span>
    </button>
  );
}
