import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Utenti admin (1–2 record). */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Membri della band. */
export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sortOrder: integer("sort_order").notNull().default(0),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    /** Strumenti / ruolo — campi per lingua */
    roleIt: varchar("role_it", { length: 255 }),
    roleFr: varchar("role_fr", { length: 255 }),
    roleEn: varchar("role_en", { length: 255 }),
    roleOc: varchar("role_oc", { length: 255 }),
    /** Breve bio / nota sullo strumento — campi per lingua */
    bioIt: text("bio_it"),
    bioFr: text("bio_fr"),
    bioEn: text("bio_en"),
    bioOc: text("bio_oc"),
    photoUrl: text("photo_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("members_sort_order_idx").on(table.sortOrder)],
);

/** Stati evento admin / pubblico. Solo `published` appare sul sito. */
export const EVENT_STATUSES = ["draft", "unpublished", "published"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/**
 * Eventi / date.
 * Future vs passate = confrontando `eventDate` con oggi.
 * Visibilità = colonna `status` (draft | unpublished | published).
 */
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventDate: date("event_date").notNull(),
    /** Ora opzionale, es. "21:00" */
    eventTime: varchar("event_time", { length: 10 }),
    venue: varchar("venue", { length: 255 }),
    city: varchar("city", { length: 120 }),
    country: varchar("country", { length: 120 }),
    address: text("address"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    ticketUrl: text("ticket_url"),
    /** Volantino caricato su Vercel Blob */
    flyerUrl: text("flyer_url"),
    titleIt: varchar("title_it", { length: 255 }).notNull(),
    titleFr: varchar("title_fr", { length: 255 }),
    titleEn: varchar("title_en", { length: 255 }),
    titleOc: varchar("title_oc", { length: 255 }),
    descriptionIt: text("description_it"),
    descriptionFr: text("description_fr"),
    descriptionEn: text("description_en"),
    descriptionOc: text("description_oc"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("events_event_date_idx").on(table.eventDate),
    index("events_published_date_idx").on(table.status, table.eventDate),
  ],
);

/** Formato release: album (sleeve + disco) o singolo (solo cover). */
export const ALBUM_RELEASE_TYPES = ["album", "single"] as const;
export type AlbumReleaseType = (typeof ALBUM_RELEASE_TYPES)[number];

/**
 * Album / discografia.
 * Upcoming vs released = confrontando `releaseDate` con oggi.
 * Visibilità = colonna `status` (draft | unpublished | published).
 */
export const albums = pgTable(
  "albums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    releaseDate: date("release_date").notNull(),
    /** album = sleeve apribile; single = sola copertina */
    releaseType: varchar("release_type", { length: 20 })
      .notNull()
      .default("album"),
    /** Copertina fronte (Vercel Blob) */
    coverUrl: text("cover_url"),
    /** Copertina retro (Vercel Blob) — solo album */
    coverBackUrl: text("cover_back_url"),
    /** Disco / vinile che esce dalla sleeve (Vercel Blob) — solo album */
    discUrl: text("disc_url"),
    /** Durata brano in secondi (utile per singoli / inserto) */
    durationSec: integer("duration_sec"),
    titleIt: varchar("title_it", { length: 255 }).notNull(),
    titleFr: varchar("title_fr", { length: 255 }),
    titleEn: varchar("title_en", { length: 255 }),
    titleOc: varchar("title_oc", { length: 255 }),
    spotifyUrl: text("spotify_url"),
    appleMusicUrl: text("apple_music_url"),
    youtubeMusicUrl: text("youtube_music_url"),
    bandcampUrl: text("bandcamp_url"),
    deezerUrl: text("deezer_url"),
    tidalUrl: text("tidal_url"),
    amazonMusicUrl: text("amazon_music_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("albums_release_date_idx").on(table.releaseDate),
    index("albums_published_date_idx").on(table.status, table.releaseDate),
    index("albums_sort_order_idx").on(table.sortOrder),
  ],
);

export const ALBUM_STATUSES = EVENT_STATUSES;
export type AlbumStatus = EventStatus;

export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type NewMember = typeof members.$inferInsert;
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
