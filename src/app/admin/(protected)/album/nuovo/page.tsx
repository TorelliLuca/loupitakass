import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { albums } from "@/lib/db/schema";

/** Crea subito una bozza e reindirizza alla modifica (niente revalidate in render). */
export default async function AdminNewAlbumPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const db = getDb();
  const [created] = await db
    .insert(albums)
    .values({
      releaseDate: new Date().toISOString().slice(0, 10),
      titleIt: "Nuovo album",
      status: "draft",
    })
    .returning({ id: albums.id });

  if (!created) {
    throw new Error("Impossibile creare la bozza.");
  }

  redirect(`/admin/album/${created.id}`);
}
