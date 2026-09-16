"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EVENT_STATUS_LABEL,
  getEventAdminStatus,
  type EventAdminStatus,
} from "@/lib/admin/event-status";
import type { Event } from "@/lib/db/schema";
import { cn } from "cn";

type EventsTableProps = {
  events: Event[];
};

type SortKey = "eventDate" | "titleIt" | "place" | "status" | "flyer";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | EventAdminStatus;

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;
const ease = [0.22, 1, 0.36, 1] as const;

const STATUS_CHIP_CLASS: Record<EventAdminStatus, string> = {
  published:
    "inline-flex bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
  unpublished:
    "inline-flex bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800",
  draft:
    "inline-flex bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function placeLabel(event: Event) {
  return [event.address, event.city].filter(Boolean).join(" · ");
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, "it", { sensitivity: "base" });
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="size-3.5" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden />
  );
}

export function EventsTable({ events }: EventsTableProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("eventDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = events.filter((event) => {
      const status = getEventAdminStatus(event);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        event.titleIt,
        event.address,
        event.city,
        event.country,
        formatDate(event.eventDate),
        EVENT_STATUS_LABEL[status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "eventDate": {
          const byDate = a.eventDate.localeCompare(b.eventDate);
          if (byDate !== 0) return byDate * dir;
          return compareText(a.eventTime ?? "", b.eventTime ?? "") * dir;
        }
        case "titleIt":
          return compareText(a.titleIt, b.titleIt) * dir;
        case "place":
          return compareText(placeLabel(a), placeLabel(b)) * dir;
        case "status": {
          const order: EventAdminStatus[] = [
            "published",
            "unpublished",
            "draft",
          ];
          const sa = order.indexOf(getEventAdminStatus(a));
          const sb = order.indexOf(getEventAdminStatus(b));
          return (sa - sb) * dir;
        }
        case "flyer": {
          const fa = a.flyerUrl ? 1 : 0;
          const fb = b.flyerUrl ? 1 : 0;
          return (fa - fb) * dir;
        }
        default:
          return 0;
      }
    });
  }, [events, query, sortDir, sortKey, statusFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "eventDate" ? "desc" : "asc");
  }

  if (events.length === 0) {
    return (
      <FadeIn inView={false}>
        <div
          className="border bg-background p-8 text-center text-sm text-muted-foreground"
          style={panelRadius}
        >
          <p>Nessun evento in database.</p>
          <Button
            nativeButton={false}
            render={<Link href="/admin/eventi/nuovo" />}
            className="mt-4"
            style={radius}
          >
            Crea il primo evento
          </Button>
        </div>
      </FadeIn>
    );
  }

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tutti" },
    { value: "published", label: "Pubblicati" },
    { value: "unpublished", label: "Non pubblicati" },
    { value: "draft", label: "Bozze" },
  ];

  const columns: { key: SortKey; label: string }[] = [
    { key: "eventDate", label: "Data" },
    { key: "titleIt", label: "Titolo (IT)" },
    { key: "place", label: "Luogo" },
    { key: "status", label: "Stato" },
    { key: "flyer", label: "Volantino" },
  ];

  return (
    <FadeIn inView={false} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca titolo, luogo, data…"
          className="max-w-sm bg-background"
          aria-label="Cerca eventi"
        />
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filtra per stato"
        >
          {statusFilters.map((item) => {
            const active = statusFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-ink text-brand-mist"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
                style={{ borderRadius: "9999px" }}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="overflow-x-auto border bg-background"
        style={panelRadius}
      >
        {filteredSorted.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nessun evento corrisponde ai filtri.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                {columns.map((col) => {
                  const active = sortKey === col.key;
                  return (
                    <th key={col.key} className="px-4 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-foreground",
                          active && "text-foreground",
                        )}
                        aria-sort={
                          active
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        {col.label}
                        <SortIcon active={active} dir={sortDir} />
                      </button>
                    </th>
                  );
                })}
                <th className="px-4 py-3 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((event, index) => {
                const status = getEventAdminStatus(event);
                return (
                  <motion.tr
                    key={event.id}
                    className="border-b last:border-b-0"
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index, 12) * 0.03,
                      ease,
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(event.eventDate)}
                      {event.eventTime ? (
                        <span className="ml-1 text-muted-foreground">
                          {event.eventTime}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{event.titleIt}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {placeLabel(event) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={STATUS_CHIP_CLASS[status]}
                        style={{ borderRadius: "9999px" }}
                      >
                        {EVENT_STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.flyerUrl ? (
                        <a
                          href={event.flyerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-ink underline underline-offset-4"
                        >
                          Apri
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          nativeButton={false}
                          render={<Link href={`/admin/eventi/${event.id}`} />}
                          variant="outline"
                          size="sm"
                          style={radius}
                        >
                          Modifica
                        </Button>
                        <DeleteEventButton
                          eventId={event.id}
                          title={event.titleIt}
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </FadeIn>
  );
}
