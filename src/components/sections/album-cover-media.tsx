"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Croce occitana 800×800 WebP trasparente (solo croce). */
export const ALBUM_COVER_FALLBACK = "/images/albums/cover-fallback.webp";

type AlbumCoverMediaProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Priorità di rete (fronte / preload retro). */
  priority?: boolean;
};

/**
 * Cover da Blob: niente `/_next/image` (in locale l’optimizer dà spesso 500
 * su URL remote Blob). Fallback: fondo rosso uniforme + croce occitana senza bg.
 */
export function AlbumCoverMedia({
  src,
  alt,
  className,
  priority = false,
}: AlbumCoverMediaProps) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={cn(
          "album-cover-fallback absolute inset-0 flex items-center justify-center",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        {!fallbackFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ALBUM_COVER_FALLBACK}
            alt=""
            aria-hidden
            className="size-[78%] object-contain"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFallbackFailed(true)}
          />
        ) : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Blob remoto: evita optimizer Next
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 size-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
      onError={() => setFailed(true)}
    />
  );
}
