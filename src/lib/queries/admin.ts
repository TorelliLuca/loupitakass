import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { albums, events, users } from "@/lib/db/schema";

export async function getAdminEvents() {
  const db = getDb();
  return db.select().from(events).orderBy(desc(events.eventDate));
}

export async function getAdminEventById(id: string) {
  const db = getDb();
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  return event ?? null;
}

export async function getAdminAlbums() {
  const db = getDb();
  return db
    .select()
    .from(albums)
    .orderBy(asc(albums.sortOrder), desc(albums.releaseDate));
}

export async function getAdminAlbumById(id: string) {
  const db = getDb();
  const [album] = await db
    .select()
    .from(albums)
    .where(eq(albums.id, id))
    .limit(1);
  return album ?? null;
}

export type AdminUserListItem = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const db = getDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
}

export async function getAdminUserById(id: string) {
  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}
