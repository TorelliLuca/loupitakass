import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function hasDatabaseUrl() {
  return Boolean(
    process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.DB_DATABASE_URL ??
      process.env.DB_POSTGRES_URL,
  );
}

function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DB_DATABASE_URL ??
    process.env.DB_POSTGRES_URL;
  if (!url) {
    throw new Error(
      "Manca DATABASE_URL (o POSTGRES_URL / DB_POSTGRES_URL). Copia .env.example in .env.local e collega Vercel Postgres.",
    );
  }
  return url;
}

/** Client Drizzle lazy — evita crash a import-time senza env (es. build senza DB). */
export function getDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof getDb>;
