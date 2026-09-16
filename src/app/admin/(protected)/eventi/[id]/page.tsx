import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEventAction } from "@/app/admin/actions/events";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventForm } from "@/components/admin/event-form";
import {
  EVENT_STATUS_LABEL,
  getEventAdminStatus,
} from "@/lib/admin/event-status";
import { getAdminEventById } from "@/lib/queries/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getAdminEventById(id);
  if (!event) notFound();

  const boundUpdate = updateEventAction.bind(null, event.id);
  const status = getEventAdminStatus(event);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/eventi" className="underline underline-offset-4">
              ← Eventi
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl text-brand-ink">
            Modifica evento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.titleIt} · {EVENT_STATUS_LABEL[status]}
          </p>
        </div>
        <DeleteEventButton eventId={event.id} title={event.titleIt} />
      </div>
      <EventForm
        event={event}
        action={boundUpdate}
        submitLabel="Salva e torna alla lista"
      />
    </div>
  );
}
