"use client";

import {
  OccitanCrossMark,
  type OccitanEmblemPlacement,
  type OccitanEmblemSize,
} from "@/components/brand/occitan-watermark";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
  tone = "default",
  wide,
  cross = true,
  crossSize = "default",
  crossPlacement = "backdrop",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "muted" | "ink";
  wide?: boolean;
  /** Emblema occitano dietro / sotto la sezione (default: sì). */
  cross?: boolean;
  crossSize?: OccitanEmblemSize;
  crossPlacement?: OccitanEmblemPlacement;
}) {
  const mark = cross ? (
    <OccitanCrossMark
      light={tone === "ink"}
      size={crossSize}
      placement={crossPlacement}
    />
  ) : null;

  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden scroll-mt-28 px-6 py-24 sm:scroll-mt-20 sm:py-32",
        tone === "default" && "bg-white text-brand-ink",
        tone === "muted" && "bg-secondary text-brand-ink",
        tone === "ink" && "bg-brand-ink text-white",
        className,
      )}
    >
      {crossPlacement === "backdrop" ? mark : null}
      <div
        className={cn(
          "relative mx-auto w-full",
          wide ? "max-w-6xl" : "max-w-5xl",
        )}
      >
        {children}
        {crossPlacement === "below" ? mark : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  lead,
  light,
  align = "left",
}: {
  title: string;
  lead?: string;
  light?: boolean;
  align?: "left" | "right" | "center";
}) {
  return (
    <FadeIn
      className={cn(
        "mb-14",
        align === "right" && "ml-auto max-w-3xl text-right",
        align === "center" && "mx-auto max-w-3xl text-center",
        align === "left" && "max-w-3xl",
      )}
    >
      <header>
        <h2
          className={cn(
            "display-title",
            light ? "text-white" : "text-brand-ink",
          )}
        >
          {title}
        </h2>
        {lead ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-base sm:text-lg",
              align === "right" && "ml-auto",
              align === "center" && "mx-auto",
              light ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {lead}
          </p>
        ) : null}
      </header>
    </FadeIn>
  );
}
