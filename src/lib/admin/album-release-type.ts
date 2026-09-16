import type { Album, AlbumReleaseType } from "@/lib/db/schema";
import { ALBUM_RELEASE_TYPES } from "@/lib/db/schema";

export function getAlbumReleaseType(album: Album): AlbumReleaseType {
  const raw = String(album.releaseType ?? "")
    .trim()
    .toLowerCase();
  if (ALBUM_RELEASE_TYPES.includes(raw as AlbumReleaseType)) {
    return raw as AlbumReleaseType;
  }
  return "album";
}

export const ALBUM_RELEASE_TYPE_LABEL: Record<AlbumReleaseType, string> = {
  album: "Album",
  single: "Singolo",
};
