"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  BLOB_MAX_BYTES,
  deleteEventMedia,
  uploadEventMedia,
  type AlbumMediaVariant,
} from "@/lib/blob";
import { getDb } from "@/lib/db";
import {
  albums,
  type AlbumReleaseType,
  type AlbumStatus,
} from "@/lib/db/schema";
import { adminAlbumsRedirect } from "@/lib/admin/flash";
import {
  parseAlbumAutosaveData,
  parseAlbumFormData,
  type AlbumAutosaveValues,
  type AlbumFormValues,
} from "@/lib/validators/album";

export type AlbumActionState = {
  error?: string;
  success?: string;
};

export type AutosaveAlbumState = {
  error?: string;
  success?: boolean;
  updatedAt?: string;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

function nullish(value: string | undefined) {
  return value ?? null;
}

function toDbValues(data: AlbumFormValues | AlbumAutosaveValues) {
  const titleIt =
    "titleIt" in data && data.titleIt?.trim()
      ? data.titleIt.trim()
      : "Nuovo album";

  return {
    releaseDate: data.releaseDate,
    releaseType: data.releaseType as AlbumReleaseType,
    sortOrder: data.sortOrder ?? 0,
    durationSec: data.durationSec ?? null,
    titleIt,
    titleFr: nullish(data.titleFr),
    titleEn: nullish(data.titleEn),
    titleOc: nullish(data.titleOc),
    spotifyUrl: nullish(data.spotifyUrl),
    appleMusicUrl: nullish(data.appleMusicUrl),
    youtubeMusicUrl: nullish(data.youtubeMusicUrl),
    bandcampUrl: nullish(data.bandcampUrl),
    deezerUrl: nullish(data.deezerUrl),
    tidalUrl: nullish(data.tidalUrl),
    amazonMusicUrl: nullish(data.amazonMusicUrl),
    status: data.status as AlbumStatus,
    updatedAt: new Date(),
  };
}

type CoverSide = {
  fileField: string;
  label: string;
  variant?: AlbumMediaVariant;
};

async function resolveAlbumImageUrl(
  formData: FormData,
  side: CoverSide,
  currentUrl: string | null,
  remove?: boolean,
) {
  if (remove) {
    await deleteEventMedia(currentUrl);
    return null;
  }

  const file = formData.get(side.fileField);
  if (!(file instanceof File) || file.size === 0) {
    return currentUrl;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${side.label}: deve essere un’immagine.`);
  }

  if (file.size > BLOB_MAX_BYTES) {
    throw new Error(`${side.label}: troppo grande (max 4 MB).`);
  }

  const blob = await uploadEventMedia(file, {
    folder: "albums",
    variant: side.variant ?? "cover",
  });
  if (currentUrl && currentUrl !== blob.url) {
    await deleteEventMedia(currentUrl);
  }
  return blob.url;
}

function revalidateAdminAlbumPaths(albumId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/album");
  if (albumId) {
    revalidatePath(`/admin/album/${albumId}`);
  }
}

function revalidatePublicPaths() {
  revalidatePath("/");
  for (const locale of ["it", "fr", "en", "oc"]) {
    revalidatePath(`/${locale}`);
  }
}

function revalidatePublicAndAdmin(albumId?: string) {
  revalidateAdminAlbumPaths(albumId);
  revalidatePublicPaths();
}

type AlbumMediaRow = {
  coverUrl: string | null;
  coverBackUrl: string | null;
  discUrl: string | null;
  status: string;
};

async function resolveAlbumMedia(
  formData: FormData,
  current: AlbumMediaRow,
  data: AlbumFormValues | AlbumAutosaveValues,
) {
  const isSingle = data.releaseType === "single";

  const coverUrl = await resolveAlbumImageUrl(
    formData,
    { fileField: "cover", label: "Fronte" },
    current.coverUrl,
    data.removeCover,
  );

  let coverBackUrl = current.coverBackUrl;
  let discUrl = current.discUrl;

  if (isSingle) {
    // Singolo: solo cover — pulisci retro/disco se presenti.
    if (coverBackUrl) {
      await deleteEventMedia(coverBackUrl);
      coverBackUrl = null;
    }
    if (discUrl) {
      await deleteEventMedia(discUrl);
      discUrl = null;
    }
  } else {
    coverBackUrl = await resolveAlbumImageUrl(
      formData,
      { fileField: "coverBack", label: "Retro" },
      current.coverBackUrl,
      data.removeCoverBack,
    );
    discUrl = await resolveAlbumImageUrl(
      formData,
      { fileField: "disc", label: "Disco", variant: "disc" },
      current.discUrl,
      data.removeDisc,
    );
  }

  return { coverUrl, coverBackUrl, discUrl };
}

export async function autosaveAlbumAction(
  albumId: string,
  formData: FormData,
): Promise<AutosaveAlbumState> {
  await requireAdmin();

  const parsed = parseAlbumAutosaveData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  try {
    const db = getDb();
    const [current] = await db
      .select({
        coverUrl: albums.coverUrl,
        coverBackUrl: albums.coverBackUrl,
        discUrl: albums.discUrl,
        status: albums.status,
      })
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    if (!current) {
      return { error: "Album non trovato." };
    }

    const media = await resolveAlbumMedia(formData, current, parsed.data);

    const updatedAt = new Date();
    await db
      .update(albums)
      .set({
        ...toDbValues(parsed.data),
        ...media,
        updatedAt,
      })
      .where(eq(albums.id, albumId));

    revalidateAdminAlbumPaths(albumId);
    const touchesPublic =
      current.status === "published" || parsed.data.status === "published";
    if (touchesPublic) {
      revalidatePublicPaths();
    }

    return { success: true, updatedAt: updatedAt.toISOString() };
  } catch (error) {
    console.error("[admin/albums/autosave]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossibile salvare la bozza.",
    };
  }
}

export async function updateAlbumAction(
  albumId: string,
  _prev: AlbumActionState,
  formData: FormData,
): Promise<AlbumActionState> {
  await requireAdmin();

  const parsed = parseAlbumFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  try {
    const db = getDb();
    const [current] = await db
      .select({
        coverUrl: albums.coverUrl,
        coverBackUrl: albums.coverBackUrl,
        discUrl: albums.discUrl,
        status: albums.status,
      })
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    if (!current) {
      return { error: "Album non trovato." };
    }

    const media = await resolveAlbumMedia(formData, current, parsed.data);

    await db
      .update(albums)
      .set({
        ...toDbValues(parsed.data),
        ...media,
      })
      .where(eq(albums.id, albumId));

    const touchesPublic =
      current.status === "published" || parsed.data.status === "published";
    if (touchesPublic) {
      revalidatePublicAndAdmin(albumId);
    } else {
      revalidateAdminAlbumPaths(albumId);
    }
  } catch (error) {
    console.error("[admin/albums/update]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare l’album.",
    };
  }

  redirect(adminAlbumsRedirect("album-updated"));
}

export async function deleteAlbumAction(albumId: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const [current] = await db
      .select({
        coverUrl: albums.coverUrl,
        coverBackUrl: albums.coverBackUrl,
        discUrl: albums.discUrl,
        status: albums.status,
      })
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1);

    await db.delete(albums).where(eq(albums.id, albumId));
    await deleteEventMedia(current?.coverUrl);
    await deleteEventMedia(current?.coverBackUrl);
    await deleteEventMedia(current?.discUrl);

    if (current?.status === "published") {
      revalidatePublicAndAdmin();
    } else {
      revalidateAdminAlbumPaths();
    }
  } catch (error) {
    console.error("[admin/albums/delete]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossibile eliminare l’album.",
    );
  }

  redirect(adminAlbumsRedirect("album-deleted"));
}
