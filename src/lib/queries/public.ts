import { and, asc, desc, eq, lte } from "drizzle-orm";
import {
  demoAlbums,
  demoEvents,
  demoMembers,
  todayIsoDate,
  albumPlatformLinks,
} from "@/lib/public-data";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { albums, events, members, type Album } from "@/lib/db/schema";

/** Eventi pubblicati; fallback demo se DB assente o errore. */
export async function getPublicEvents() {
  if (!hasDatabaseUrl()) return demoEvents;

  try {
    const db = getDb();
    return await db
      .select()
      .from(events)
      .where(eq(events.status, "published"))
      .orderBy(asc(events.eventDate));
  } catch (error) {
    console.error("[getPublicEvents] DB error, fallback demo:", error);
    return demoEvents;
  }
}

/** Album pubblicati; fallback demo se DB assente o errore. */
export async function getPublicAlbums() {
  if (!hasDatabaseUrl()) return demoAlbums;

  try {
    const db = getDb();
    return await db
      .select()
      .from(albums)
      .where(eq(albums.status, "published"))
      .orderBy(asc(albums.sortOrder), desc(albums.releaseDate));
  } catch (error) {
    console.error("[getPublicAlbums] DB error, fallback demo:", error);
    return demoAlbums;
  }
}

/**
 * Album pubblicato già uscito con `releaseDate` più recente
 * e almeno un link piattaforma (esclude draft/unpublished e date future).
 */
export async function getLatestPublicAlbum(): Promise<Album | null> {
  const today = todayIsoDate();

  const pick = (list: Album[]) => {
    const released = list
      .filter((a) => a.status === "published" && a.releaseDate <= today)
      .sort((a, b) => {
        const byDate = b.releaseDate.localeCompare(a.releaseDate);
        if (byDate !== 0) return byDate;
        const aLinks = albumPlatformLinks(a).length;
        const bLinks = albumPlatformLinks(b).length;
        if (aLinks !== bLinks) return bLinks - aLinks;
        return (
          b.updatedAt.getTime() - a.updatedAt.getTime() ||
          a.sortOrder - b.sortOrder
        );
      });
    return released.find((a) => albumPlatformLinks(a).length > 0) ?? null;
  };

  if (!hasDatabaseUrl()) return pick(demoAlbums);

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(albums)
      .where(
        and(eq(albums.status, "published"), lte(albums.releaseDate, today)),
      )
      .orderBy(desc(albums.releaseDate), desc(albums.updatedAt));
    return pick(rows);
  } catch (error) {
    console.error("[getLatestPublicAlbum] DB error, fallback demo:", error);
    return pick(demoAlbums);
  }
}

/** Membri attivi; fallback demo se DB assente o errore. */
export async function getPublicMembers() {
  if (!hasDatabaseUrl()) return demoMembers;

  try {
    const db = getDb();
    return await db
      .select()
      .from(members)
      .where(eq(members.isActive, true))
      .orderBy(asc(members.sortOrder));
  } catch (error) {
    console.error("[getPublicMembers] DB error, fallback demo:", error);
    return demoMembers;
  }
}
