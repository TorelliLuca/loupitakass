import type { Event, EventStatus } from "@/lib/db/schema";
import { EVENT_STATUSES } from "@/lib/db/schema";

export type EventAdminStatus = EventStatus;

export function getEventAdminStatus(event: Event): EventAdminStatus {
  if (EVENT_STATUSES.includes(event.status as EventStatus)) {
    return event.status as EventStatus;
  }
  return "draft";
}

export const EVENT_STATUS_LABEL: Record<EventAdminStatus, string> = {
  published: "Pubblicato",
  unpublished: "Non pubblicato",
  draft: "Bozza",
};
