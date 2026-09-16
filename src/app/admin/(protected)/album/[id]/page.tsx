import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAlbumAction } from "@/app/admin/actions/albums";
import { AlbumForm } from "@/components/admin/album-form";
import { DeleteAlbumButton } from "@/components/admin/delete-album-button";
import {
  ALBUM_STATUS_LABEL,
  getAlbumAdminStatus,
} from "@/lib/admin/album-status";
import { getAdminAlbumById } from "@/lib/queries/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditAlbumPage({ params }: PageProps) {
  const { id } = await params;
  const album = await getAdminAlbumById(id);
  if (!album) notFound();

  const boundUpdate = updateAlbumAction.bind(null, album.id);
  const status = getAlbumAdminStatus(album);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/album" className="underline underline-offset-4">
              ← Album
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl text-brand-ink">
            Modifica album
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {album.titleIt} · {ALBUM_STATUS_LABEL[status]}
          </p>
        </div>
        <DeleteAlbumButton albumId={album.id} title={album.titleIt} />
      </div>
      <AlbumForm
        album={album}
        action={boundUpdate}
        submitLabel="Salva e torna alla lista"
      />
    </div>
  );
}
