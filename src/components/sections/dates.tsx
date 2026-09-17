import { getLocale, getTranslations } from "next-intl/server";
import type { Event } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import { splitEvents } from "@/lib/public-data";
import { OccitanCrossMark } from "@/components/brand/occitan-watermark";
import { FadeIn } from "@/components/motion/fade-in";
import {
  EventList,
  PastEventList,
} from "@/components/sections/event-list";
import { EventsMapPanel } from "@/components/sections/events-map-panel";
import { Section, SectionHeading } from "@/components/sections/section";

export async function DatesSection({ events }: { events: Event[] }) {
  const t = await getTranslations("Dates");
  const locale = (await getLocale()) as AppLocale;
  const { upcoming, past } = splitEvents(events);

  const listLabels = {
    ticketsLabel: t("tickets"),
    flyerLabel: t("flyer"),
    timeLabel: t("time"),
    detailsLabel: t("details"),
    comeSeeLabel: t("comeSee"),
    venueLabel: t("venue"),
  };

  return (
    <Section id="date" wide cross={false}>
      <SectionHeading title={t("title")} lead={t("lead")} align="right" />
      <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <div className="relative space-y-16">
          <OccitanCrossMark size="sm" placement="backdrop" />
          <div className="relative z-10">
            <FadeIn>
              <h3 className="mb-2 text-xs font-semibold tracking-[0.28em] text-brand-ink/50 uppercase">
                {t("upcoming")}
              </h3>
            </FadeIn>
            <EventList
              items={upcoming}
              locale={locale}
              empty={t("emptyUpcoming")}
              {...listLabels}
            />
          </div>
          <div className="relative z-10">
            <FadeIn>
              <h3 className="mb-2 text-xs font-semibold tracking-[0.28em] text-brand-ink/40 uppercase">
                {t("past")}
              </h3>
            </FadeIn>
            <PastEventList
              items={past}
              locale={locale}
              empty={t("emptyPast")}
              showAllLabel={t("showAll")}
              dialogTitle={t("pastAll")}
              {...listLabels}
            />
          </div>
        </div>
        {/* Niente fade: MapLibre misura male il canvas se il contenitore parte da opacity 0. */}
        <div className="min-w-0">
          <EventsMapPanel events={events} />
        </div>
      </div>
    </Section>
  );
}
