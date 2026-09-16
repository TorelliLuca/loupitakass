"use client";

import type { Event } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import {
  localizedEventDescription,
  localizedEventTitle,
} from "@/lib/public-data";
import { EventDirectionsLink } from "@/components/sections/event-directions-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatEventDateParts(isoDate: string, locale: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  const fmtLocale = locale === "oc" ? "fr" : locale;
  return {
    weekday: new Intl.DateTimeFormat(fmtLocale, { weekday: "long" }).format(
      date,
    ),
    dayMonth: new Intl.DateTimeFormat(fmtLocale, {
      day: "numeric",
      month: "long",
    }).format(date),
    year: new Intl.DateTimeFormat(fmtLocale, { year: "numeric" }).format(date),
  };
}

type EventDetailsButtonProps = {
  event: Event;
  locale: AppLocale;
  detailsLabel: string;
  comeSeeLabel: string;
  ticketsLabel: string;
  flyerLabel: string;
  timeLabel: string;
  venueLabel: string;
};

export function EventDetailsButton({
  event,
  locale,
  detailsLabel,
  comeSeeLabel,
  ticketsLabel,
  flyerLabel,
  timeLabel,
  venueLabel,
}: EventDetailsButtonProps) {
  const title = localizedEventTitle(event, locale);
  const description = localizedEventDescription(event, locale);
  const dateParts = formatEventDateParts(event.eventDate, locale);
  const place = [event.address, event.city, event.country]
    .filter(Boolean)
    .join(" · ");
  const hasCoords =
    typeof event.lat === "number" && typeof event.lng === "number";
  const placeLabel =
    [event.venue, event.city].filter(Boolean).join(", ") || place;

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer text-sm text-brand-ink underline underline-offset-4">
        {detailsLabel}
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(92vh,40rem)] w-full max-w-[min(92vw,28rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(92vw,28rem)]"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b border-brand-ink/10 px-5 py-5 pr-12 text-left">
          <p className="text-xs font-semibold tracking-[0.28em] text-brand-brass uppercase">
            {dateParts.weekday}
          </p>
          <DialogTitle className="mt-1 font-display text-4xl leading-[1.05] font-normal text-brand-ink sm:text-5xl">
            {dateParts.dayMonth}
          </DialogTitle>
          <p className="mt-1 font-display text-2xl text-brand-ink/55">
            {dateParts.year}
          </p>
          {event.eventTime ? (
            <p className="mt-3 text-sm font-semibold tracking-wide text-brand-ink uppercase">
              {timeLabel} {event.eventTime}
            </p>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <h3 className="font-display text-2xl leading-tight text-brand-ink">
              {title}
            </h3>
            {event.venue ? (
              <p className="mt-2 text-sm font-semibold text-brand-ink">
                <span className="sr-only">{venueLabel}: </span>
                {event.venue}
              </p>
            ) : null}
            {place ? (
              <p className="mt-1 text-sm text-muted-foreground">{place}</p>
            ) : null}
          </div>

          {description ? (
            <DialogDescription className="whitespace-pre-line text-base leading-relaxed text-brand-ink/80">
              {description}
            </DialogDescription>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {hasCoords ? (
              <EventDirectionsLink
                lat={event.lat!}
                lng={event.lng!}
                label={comeSeeLabel}
                placeLabel={placeLabel}
              />
            ) : null}
            {event.ticketUrl ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-ink underline underline-offset-4"
              >
                {ticketsLabel}
              </a>
            ) : null}
            {event.flyerUrl ? (
              <a
                href={event.flyerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-ink underline underline-offset-4"
              >
                {flyerLabel}
              </a>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
