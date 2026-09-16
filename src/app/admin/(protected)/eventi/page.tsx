import Link from "next/link";
import { Suspense } from "react";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { EventsTable } from "@/components/admin/events-table";
import { Button } from "@/components/ui/button";
import { getAdminEvents } from "@/lib/queries/admin";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <AdminFlashToast />
      </Suspense>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-ink">Eventi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea bozze, pubblica o nascondi le date sul sito.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/eventi/nuovo" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Nuovo evento
        </Button>
      </div>
      <EventsTable events={events} />
    </div>
  );
}
