import type { Album, AlbumStatus } from "@/lib/db/schema";
import { ALBUM_STATUSES } from "@/lib/db/schema";

export type AlbumAdminStatus = AlbumStatus;

export function getAlbumAdminStatus(album: Album): AlbumAdminStatus {
  if (ALBUM_STATUSES.includes(album.status as AlbumStatus)) {
    return album.status as AlbumStatus;
  }
  return "draft";
}

export const ALBUM_STATUS_LABEL: Record<AlbumAdminStatus, string> = {
  published: "Pubblicato",
  unpublished: "Non pubblicato",
  draft: "Bozza",
};
