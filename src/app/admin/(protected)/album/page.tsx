import Link from "next/link";
import { Suspense } from "react";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AlbumsTable } from "@/components/admin/albums-table";
import { Button } from "@/components/ui/button";
import { getAdminAlbums } from "@/lib/queries/admin";

export default async function AdminAlbumsPage() {
  const albums = await getAdminAlbums();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <AdminFlashToast />
      </Suspense>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-ink">Album</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestisci discografia, cover e link alle piattaforme.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/album/nuovo" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Nuovo album
        </Button>
      </div>
      <AlbumsTable albums={albums} />
    </div>
  );
}
