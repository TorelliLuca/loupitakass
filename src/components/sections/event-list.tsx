"use client";

import type { Event } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { localizedEventTitle, PAST_EVENTS_LIST_LIMIT } from "@/lib/public-data";
import { FadeIn, FadeInItem, Stagger } from "@/components/motion/fade-in";
import { EventDetailsButton } from "@/components/sections/event-details-button";
import { EventDirectionsLink } from "@/components/sections/event-directions-link";
import { EventFlyerButton } from "@/components/sections/event-flyer-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatEventDateBox(isoDate: string, locale: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  const fmtLocale = locale === "oc" ? "fr" : locale;
  return {
    day: new Intl.DateTimeFormat(fmtLocale, { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat(fmtLocale, { month: "short" })
      .format(date)
      .replace(/\.$/, "")
      .toUpperCase(),
    year: new Intl.DateTimeFormat(fmtLocale, { year: "numeric" }).format(date),
  };
}

type EventListLabels = {
  ticketsLabel: string;
  flyerLabel: string;
  timeLabel: string;
  detailsLabel: string;
  comeSeeLabel: string;
  venueLabel: string;
};

type EventListProps = EventListLabels & {
  items: Event[];
  locale: AppLocale;
  empty: string;
};

function EventDateBox({
  isoDate,
  locale,
  compact = false,
}: {
  isoDate: string;
  locale: AppLocale;
  compact?: boolean;
}) {
  const { day, month, year } = formatEventDateBox(isoDate, locale);

  return (
    <time
      dateTime={isoDate}
      className={
        compact
          ? "flex size-18 shrink-0 flex-col items-center justify-center border border-brand-ink/15 bg-brand-mist/30 text-center"
          : "flex size-20 shrink-0 flex-col items-center justify-center border border-brand-ink/15 bg-brand-mist/30 text-center sm:size-24"
      }
    >
      <span
        className={
          compact
            ? "font-display text-2xl leading-none text-brand-ink"
            : "font-display text-3xl leading-none text-brand-ink sm:text-4xl"
        }
      >
        {day}
      </span>
      <span
        className={
          compact
            ? "mt-1 text-xs font-semibold tracking-[0.16em] text-brand-brass uppercase"
            : "mt-1 text-xs font-semibold tracking-[0.18em] text-brand-brass uppercase sm:text-sm"
        }
      >
        {month}
      </span>
      <span
        className={
          compact
            ? "mt-0.5 text-xs font-medium tracking-wide text-brand-ink/55"
            : "mt-0.5 text-xs font-medium tracking-wide text-brand-ink/55 sm:text-sm"
        }
      >
        {year}
      </span>
    </time>
  );
}

function EventRow({
  event,
  locale,
  ticketsLabel,
  flyerLabel,
  timeLabel,
  detailsLabel,
  comeSeeLabel,
  venueLabel,
  compact = false,
}: EventListLabels & {
  event: Event;
  locale: AppLocale;
  compact?: boolean;
}) {
  const title = localizedEventTitle(event, locale);
  const hasCoords =
    typeof event.lat === "number" && typeof event.lng === "number";
  const place = [event.address, event.city, event.country]
    .filter(Boolean)
    .join(" · ");
  const placeLabel =
    [event.venue, event.city].filter(Boolean).join(", ") ||
    [event.address, event.city].filter(Boolean).join(", ");

  return (
    <div
      className={
        compact
          ? "flex items-start gap-3 py-4"
          : "flex items-start gap-4 py-6 sm:gap-5"
      }
    >
      <EventDateBox
        isoDate={event.eventDate}
        locale={locale}
        compact={compact}
      />
      <div className="min-w-0 flex-1">
        <p
          className={
            compact
              ? "font-display text-2xl leading-tight text-brand-ink sm:text-3xl"
              : "font-display text-3xl leading-tight text-brand-ink sm:text-4xl"
          }
        >
          {title}
        </p>
        {event.eventTime ? (
          <p className="mt-1.5 text-base font-semibold tracking-wide text-brand-ink/70 uppercase">
            {timeLabel} {event.eventTime}
          </p>
        ) : null}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          {place ? (
            <p className="text-base text-muted-foreground">{place}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <EventDetailsButton
              event={event}
              locale={locale}
              detailsLabel={detailsLabel}
              comeSeeLabel={comeSeeLabel}
              ticketsLabel={ticketsLabel}
              flyerLabel={flyerLabel}
              timeLabel={timeLabel}
              venueLabel={venueLabel}
            />
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
              <EventFlyerButton
                url={event.flyerUrl}
                label={flyerLabel}
                title={title}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventList({
  items,
  locale,
  empty,
  ticketsLabel,
  flyerLabel,
  timeLabel,
  detailsLabel,
  comeSeeLabel,
  venueLabel,
}: EventListProps) {
  if (items.length === 0) {
    return (
      <FadeIn>
        <p className="text-sm text-muted-foreground">{empty}</p>
      </FadeIn>
    );
  }

  return (
    <Stagger as="ul" className="divide-y divide-brand-ink/10" stagger={0.05}>
      {items.map((event) => (
        <FadeInItem key={event.id} as="li" y={10}>
          <EventRow
            event={event}
            locale={locale}
            ticketsLabel={ticketsLabel}
            flyerLabel={flyerLabel}
            timeLabel={timeLabel}
            detailsLabel={detailsLabel}
            comeSeeLabel={comeSeeLabel}
            venueLabel={venueLabel}
          />
        </FadeInItem>
      ))}
    </Stagger>
  );
}

/** Lista senza motion: adatta a overlay/dialog (whileInView nasconderebbe le voci). */
function StaticEventList({
  items,
  locale,
  ticketsLabel,
  flyerLabel,
  timeLabel,
  detailsLabel,
  comeSeeLabel,
  venueLabel,
}: EventListLabels & { items: Event[]; locale: AppLocale }) {
  return (
    <ul className="divide-y divide-brand-ink/10">
      {items.map((event) => (
        <li key={event.id}>
          <EventRow
            event={event}
            locale={locale}
            ticketsLabel={ticketsLabel}
            flyerLabel={flyerLabel}
            timeLabel={timeLabel}
            detailsLabel={detailsLabel}
            comeSeeLabel={comeSeeLabel}
            venueLabel={venueLabel}
            compact
          />
        </li>
      ))}
    </ul>
  );
}

type PastEventListProps = EventListProps & {
  showAllLabel: string;
  dialogTitle: string;
  initialLimit?: number;
};

export function PastEventList({
  items,
  showAllLabel,
  dialogTitle,
  initialLimit = PAST_EVENTS_LIST_LIMIT,
  empty,
  ...listProps
}: PastEventListProps) {
  const preview = items.slice(0, initialLimit);
  const canShowAll = items.length > initialLimit;

  return (
    <div>
      <EventList items={preview} empty={empty} {...listProps} />
      {canShowAll ? (
        <Dialog>
          <DialogTrigger className="mt-4 cursor-pointer text-sm font-semibold tracking-wide text-brand-ink underline underline-offset-4 transition-opacity hover:opacity-70">
            {showAllLabel}
          </DialogTrigger>
          <DialogContent
            className="flex max-h-[min(92vh,40rem)] w-full max-w-[min(92vw,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(92vw,40rem)]"
            aria-describedby={undefined}
          >
            <DialogHeader className="shrink-0 border-b border-brand-ink/10 px-5 py-4 pr-12">
              <DialogTitle className="font-display text-2xl font-normal text-brand-ink">
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              <StaticEventList items={items} {...listProps} />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
