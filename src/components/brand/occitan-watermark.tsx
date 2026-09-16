import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export type OccitanEmblemSize = "default" | "sm";
export type OccitanEmblemPlacement = "backdrop" | "below";

type OccitanCrossMarkProps = {
  className?: string;
  /** Su fondi scuri: emblema un po’ più chiaro/visibile. */
  light?: boolean;
  size?: OccitanEmblemSize;
  placement?: OccitanEmblemPlacement;
  /** Override asset (default: emblema croce+stella). */
  src?: string;
};

/**
 * Emblema occitano (croce + stellina), grigio chiaro su trasparente.
 */
export function OccitanCrossMark({
  className,
  light = false,
  size = "default",
  placement = "backdrop",
  src = site.images.occitanEmblem,
}: OccitanCrossMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset decorativo SVG locale
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(
        "occitan-section-emblem pointer-events-none select-none",
        light && "occitan-section-emblem--light",
        size === "sm" && "occitan-section-emblem--sm",
        placement === "backdrop" && "occitan-section-emblem--backdrop",
        placement === "below" && "occitan-section-emblem--below",
        className,
      )}
    />
  );
}
