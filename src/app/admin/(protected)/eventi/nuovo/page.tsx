import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";

/** Crea subito una bozza e reindirizza alla modifica (niente revalidate in render). */
export default async function AdminNewEventPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const db = getDb();
  const [created] = await db
    .insert(events)
    .values({
      eventDate: new Date().toISOString().slice(0, 10),
      titleIt: "Nuovo evento",
      status: "draft",
    })
    .returning({ id: events.id });

  if (!created) {
    throw new Error("Impossibile creare la bozza.");
  }

  redirect(`/admin/eventi/${created.id}`);
}
