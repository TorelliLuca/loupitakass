"use client";

import { ExternalLink, Play } from "lucide-react";
import type { SocialPost } from "@/lib/meta/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SocialLatestPostProps = {
  post: SocialPost | null;
  locale: string;
  handle: string;
  emptyLabel: string;
  openPostLabel: string;
  videoLabel: string;
  openOnPlatformLabel: string;
  noCaptionLabel: string;
};

function formatPostDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function SocialLatestPost({
  post,
  locale,
  handle,
  emptyLabel,
  openPostLabel,
  videoLabel,
  openOnPlatformLabel,
  noCaptionLabel,
}: SocialLatestPostProps) {
  if (!post) {
    return (
      <div className="flex min-h-64 items-center justify-center bg-white/5 px-6 text-center text-sm text-white/55 sm:min-h-70">
        {emptyLabel}
      </div>
    );
  }

  const isVideo = post.mediaType === "VIDEO";
  const dateLocale = locale === "oc" ? "fr" : locale;
  const dateLabel = formatPostDate(post.timestamp, dateLocale);
  const caption = post.caption?.trim() || null;

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "group relative flex w-full cursor-pointer flex-col overflow-hidden bg-black/35 text-left outline-none",
          "min-h-72 sm:min-h-80",
          "transition-transform duration-300 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand-brass",
        )}
        aria-label={openPostLabel}
      >
        <div className="relative flex min-h-56 flex-1 items-center justify-center p-3 sm:min-h-64 sm:p-4">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="max-h-64 w-full object-contain transition duration-500 group-hover:scale-[1.02] sm:max-h-80"
            />
          ) : (
            <p className="line-clamp-6 px-2 text-center text-sm leading-relaxed text-white/90 sm:text-base">
              {caption || openPostLabel}
            </p>
          )}

          {isVideo ? (
            <span
              className="absolute right-3 top-3 flex size-9 items-center justify-center bg-black/50 text-white sm:size-10"
              aria-label={videoLabel}
            >
              <Play className="size-3.5 fill-current sm:size-4" aria-hidden />
            </span>
          ) : null}
        </div>

        <span className="border-t border-white/10 bg-black/40 px-3 py-3 sm:px-4 sm:py-3.5">
          {dateLabel ? (
            <span className="mb-1 block text-[10px] tracking-wide text-white/55 uppercase sm:text-[11px]">
              {dateLabel}
            </span>
          ) : null}
          {caption ? (
            <span className="line-clamp-2 text-sm leading-snug text-white/95">
              {caption}
            </span>
          ) : (
            <span className="text-sm text-white/70">{handle}</span>
          )}
        </span>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-0 text-brand-ink shadow-2xl ring-0",
          "max-h-[min(96dvh,52rem)] max-w-[min(calc(100vw-1.5rem),56rem)]",
          "sm:max-w-[min(calc(100vw-2rem),56rem)]",
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b border-brand-ink/10 px-4 py-3.5 pr-12 sm:px-7 sm:py-5">
          <DialogTitle className="font-display text-2xl font-normal tracking-tight text-brand-ink sm:text-4xl">
            {handle}
          </DialogTitle>
          {dateLabel ? (
            <DialogDescription className="mt-0.5 text-xs text-brand-ink/55 sm:mt-1 sm:text-sm">
              {dateLabel}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-y-auto md:grid-cols-2 md:grid-rows-1 md:overflow-hidden">
          <div className="relative flex items-center justify-center bg-brand-ink/4 px-3 py-3 sm:px-4 sm:py-4 md:min-h-88 md:overflow-hidden">
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="max-h-[min(38dvh,18rem)] w-full object-contain md:max-h-[min(70dvh,36rem)] md:h-full"
              />
            ) : (
              <div className="flex min-h-32 items-center justify-center px-4 text-sm text-brand-ink/45">
                {handle}
              </div>
            )}
            {isVideo ? (
              <span
                className="absolute right-3 top-3 flex size-9 items-center justify-center bg-brand-ink/70 text-white sm:size-10"
                aria-label={videoLabel}
              >
                <Play className="size-3.5 fill-current sm:size-4" aria-hidden />
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-7 sm:py-7 md:overflow-y-auto">
            <p className="min-h-0 flex-1 whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-brand-ink/90 sm:text-base sm:leading-7">
              {caption || noCaptionLabel}
            </p>

            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-brand-ink px-5 py-3 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90 sm:w-fit sm:py-2.5"
            >
              {openOnPlatformLabel}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
