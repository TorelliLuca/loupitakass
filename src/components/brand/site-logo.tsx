import Image from "next/image";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const LOGO_ASPECT = {
  /** logo.png 1600×883 */
  solid: 883 / 1600,
  /** logo-transparent.png 432×306 (croppato) */
  transparent: 306 / 432,
} as const;

type SiteLogoProps = {
  className?: string;
  /** Larghezza visualizzata (Next Image `sizes` / width). */
  width?: number;
  priority?: boolean;
  /**
   * `transparent` — senza fondo, ideale su scuro (hero/footer/header top).
   * `solid` — badge rosso, leggibile anche su bianco.
   */
  variant?: keyof typeof LOGO_ASPECT;
};

export function SiteLogo({
  className,
  width = 160,
  priority = false,
  variant = "transparent",
}: SiteLogoProps) {
  const src =
    variant === "solid" ? site.images.logo : site.images.logoTransparent;
  const height = Math.round(width * LOGO_ASPECT[variant]);

  return (
    <Image
      src={src}
      alt={site.name}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto", className)}
      sizes={`${width}px`}
    />
  );
}
