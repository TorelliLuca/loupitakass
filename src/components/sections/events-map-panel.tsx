"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { useLocale, useTranslations } from "next-intl";
import type { Event } from "@/lib/db/schema";
import type { AppLocale } from "@/i18n/routing";
import {
  isUpcomingEvent,
  localizedEventTitle,
  todayIsoDate,
} from "@/lib/public-data";
import { createEventMapMarker } from "@/components/sections/map-event-marker";
import { cn } from "@/lib/utils";

type Filter = "all" | "upcoming" | "past";

/** Marker passati: creati a batch per non bloccare il main thread. */
const PAST_BATCH_SIZE = 10;
/** Pausa tra un batch e il successivo (animazioni del batch partono insieme). */
const PAST_BATCH_GAP_MS = 420;

type MapEvent = Pick<
  Event,
  | "id"
  | "eventDate"
  | "address"
  | "city"
  | "lat"
  | "lng"
  | "titleIt"
  | "titleFr"
  | "titleEn"
  | "titleOc"
>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMapDate(isoDate: string, locale: AppLocale) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat(locale === "oc" ? "fr" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Tile OSM gratuiti — niente API key. */
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export function EventsMapPanel({ events }: { events: MapEvent[] }) {
  const t = useTranslations("Map");
  const locale = useLocale() as AppLocale;
  const [filter, setFilter] = useState<Filter>("all");
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const reduceMotionRef = useRef(false);
  const today = todayIsoDate();

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (event.lat == null || event.lng == null) return false;
      const upcoming = isUpcomingEvent(event as Event, today);
      if (filter === "upcoming") return upcoming;
      if (filter === "past") return !upcoming;
      return true;
    });
  }, [events, filter, today]);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const el = mapContainer.current;
    if (!el || mapRef.current) return;

    const map = new maplibregl.Map({
      container: el,
      style: MAP_STYLE,
      center: [7.5, 44.8],
      zoom: 6.2,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    mapRef.current = map;

    const resize = () => map.resize();
    requestAnimationFrame(resize);
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const clusters = useMemo(() => {
    const byCoord = new Map<string, MapEvent[]>();
    for (const event of filtered) {
      if (event.lat == null || event.lng == null) continue;
      const key = `${event.lat},${event.lng}`;
      const group = byCoord.get(key);
      if (group) group.push(event);
      else byCoord.set(key, [event]);
    }
    return Array.from(byCoord.values()).map((group) =>
      [...group].sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    );
  }, [filtered]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    const animate = !reduceMotionRef.current;
    const timers: number[] = [];
    let cancelled = false;

    const upcomingGroups: MapEvent[][] = [];
    const pastGroups: MapEvent[][] = [];

    for (const group of clusters) {
      const event = group[0];
      if (event.lat == null || event.lng == null) continue;
      bounds.extend([event.lng, event.lat]);
      const hasUpcoming = group.some((e) =>
        isUpcomingEvent(e as Event, today),
      );
      if (hasUpcoming) upcomingGroups.push(group);
      else pastGroups.push(group);
    }

    const addMarker = (
      group: MapEvent[],
      options: { upcoming: boolean; animationDelayMs: number },
    ) => {
      const event = group[0];
      if (event.lat == null || event.lng == null) return;

      const count = group.length;
      const place = [event.address, event.city].filter(Boolean).join(" · ");
      const label =
        count > 1
          ? t("clusterLabel", { count, place: place || event.city || "" })
          : localizedEventTitle(event as Event, locale);

      const markerEl = createEventMapMarker({
        upcoming: options.upcoming,
        label,
        animate,
        count,
        animationDelayMs: options.animationDelayMs,
      });

      const popupHtml =
        count === 1
          ? `<strong>${escapeHtml(localizedEventTitle(event as Event, locale))}</strong><br/>${escapeHtml(place)}`
          : `<strong>${escapeHtml(place || t("clusterPlaceFallback"))}</strong>
             <span class="event-map-popup__meta">${escapeHtml(t("clusterCount", { count }))}</span>
             <ul class="event-map-popup__list">${group
               .map((e) => {
                 const title = escapeHtml(
                   localizedEventTitle(e as Event, locale),
                 );
                 const date = escapeHtml(formatMapDate(e.eventDate, locale));
                 return `<li><span>${date}</span> · ${title}</li>`;
               })
               .join("")}</ul>`;

      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: "bottom",
      })
        .setLngLat([event.lng, event.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: 18,
            closeButton: false,
            className: count > 1 ? "event-map-popup" : undefined,
          }).setHTML(popupHtml),
        )
        .addTo(map);

      markersRef.current.push(marker);
    };

    // Date future: poche, leggero stagger individuale
    upcomingGroups.forEach((group, index) => {
      addMarker(group, {
        upcoming: true,
        animationDelayMs: animate ? index * 110 : 0,
      });
    });

    // Date passate: batch da 30, animazione sincronizzata per batch
    const schedulePastBatches = () => {
      if (pastGroups.length === 0) return;

      if (!animate) {
        pastGroups.forEach((group) => {
          addMarker(group, { upcoming: false, animationDelayMs: 0 });
        });
        return;
      }

      let batchIndex = 0;
      const runBatch = () => {
        if (cancelled) return;
        const start = batchIndex * PAST_BATCH_SIZE;
        const slice = pastGroups.slice(start, start + PAST_BATCH_SIZE);
        if (slice.length === 0) return;

        // Stesso delay = stessa animazione per tutto il batch
        for (const group of slice) {
          addMarker(group, { upcoming: false, animationDelayMs: 0 });
        }

        batchIndex += 1;
        if (start + PAST_BATCH_SIZE < pastGroups.length) {
          timers.push(window.setTimeout(runBatch, PAST_BATCH_GAP_MS));
        }
      };

      runBatch();
    };

    schedulePastBatches();
    map.resize();

    const boundsDelay = animate
      ? Math.min(upcomingGroups.length * 110 + 280, 900)
      : 0;

    timers.push(
      window.setTimeout(() => {
        if (cancelled || clusters.length === 0) return;
        if (clusters.length === 1) {
          const only = clusters[0][0];
          map.flyTo({
            center: [only.lng!, only.lat!],
            zoom: 10,
            essential: true,
          });
        } else {
          map.fitBounds(bounds, { padding: 48, maxZoom: 11, duration: 600 });
        }
      }, boundsDelay),
    );

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [clusters, locale, t, today]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "upcoming", label: t("filterUpcoming") },
    { id: "past", label: t("filterPast") },
  ];

  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-xs font-semibold tracking-[0.28em] text-brand-ink/50 uppercase">
        {t("title")}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">{t("lead")}</p>

      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label={t("title")}
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition-colors",
              filter === item.id
                ? "bg-brand-brass text-brand-ink"
                : "bg-secondary text-brand-ink hover:bg-brand-ink hover:text-white",
            )}
            aria-pressed={filter === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : null}

      <div className="relative isolate h-[min(28rem,60vh)] w-full overflow-hidden bg-secondary lg:h-[min(32rem,70vh)] lg:sticky lg:top-28">
        <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
