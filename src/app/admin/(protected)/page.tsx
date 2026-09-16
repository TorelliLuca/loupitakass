import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { getAdminAlbums, getAdminEvents } from "@/lib/queries/admin";

const panelRadius = { borderRadius: "1rem" } as const;

export default async function AdminDashboardPage() {
  const [events, albums] = await Promise.all([
    getAdminEvents(),
    getAdminAlbums(),
  ]);
  const publishedEvents = events.filter(
    (event) => event.status === "published",
  ).length;
  const publishedAlbums = albums.filter(
    (album) => album.status === "published",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-brand-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestisci date e contenuti del sito Lou Pitakass.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn
          delay={0.05}
          className="bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10"
          style={panelRadius}
        >
          <p className="text-sm font-medium">Eventi totali</p>
          <p className="mt-1 text-sm text-muted-foreground">
            In database, pubblicati e bozze.
          </p>
          <p className="mt-4 font-display text-4xl text-brand-ink">
            {events.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {publishedEvents} pubblicati
          </p>
        </FadeIn>
        <FadeIn
          delay={0.1}
          className="bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10"
          style={panelRadius}
        >
          <p className="text-sm font-medium">Album totali</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Discografia, pubblicati e bozze.
          </p>
          <p className="mt-4 font-display text-4xl text-brand-pine">
            {albums.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {publishedAlbums} pubblicati
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={0.15} className="flex flex-wrap gap-3">
        <Button
          nativeButton={false}
          render={<Link href="/admin/eventi" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Gestisci eventi
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/admin/album" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Gestisci album
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/admin/utenti/gestisci" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Gestisci admin
        </Button>
      </FadeIn>
    </div>
  );
}
