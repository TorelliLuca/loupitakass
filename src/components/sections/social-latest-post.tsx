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
          "group relative flex w-full min-w-0 max-w-full cursor-pointer flex-col overflow-hidden bg-black/35 text-left outline-none",
          "min-h-72 sm:min-h-80",
          "transition-transform duration-300 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand-brass",
        )}
        aria-label={openPostLabel}
      >
        <div className="relative flex min-h-56 min-w-0 flex-1 items-center justify-center overflow-hidden p-3 sm:min-h-64 sm:p-4">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="max-h-64 max-w-full object-contain transition duration-500 group-hover:scale-[1.02] sm:max-h-80"
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

      <DialogContent layout="viewport" aria-describedby={undefined}>
        <DialogHeader className="shrink-0 border-b border-brand-ink/10 px-4 py-3 pr-12 sm:px-7 sm:py-5">
          <DialogTitle className="font-display text-xl font-normal tracking-tight text-brand-ink sm:text-4xl">
            {handle}
          </DialogTitle>
          {dateLabel ? (
            <DialogDescription className="mt-0.5 text-xs text-brand-ink/55 sm:mt-1 sm:text-sm">
              {dateLabel}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:grid md:grid-cols-2 md:grid-rows-1">
          <div className="relative flex min-h-0 flex-[1.35] items-center justify-center overflow-hidden bg-brand-ink/4 px-2 py-2 sm:flex-1 sm:px-4 sm:py-4">
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex min-h-24 items-center justify-center px-4 text-sm text-brand-ink/45">
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

          <div className="flex min-h-0 max-h-[40%] flex-col gap-3 overflow-hidden border-t border-brand-ink/10 px-4 py-3 sm:max-h-none sm:flex-1 sm:gap-6 sm:overflow-y-auto sm:px-7 sm:py-7 md:border-t-0">
            <p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-brand-ink/90 sm:text-base sm:leading-7">
              {caption || noCaptionLabel}
            </p>

            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 bg-brand-ink px-5 py-3 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90 sm:w-fit sm:py-2.5"
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
