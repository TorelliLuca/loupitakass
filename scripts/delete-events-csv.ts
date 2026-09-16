import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events } from "../src/lib/db/schema";
import {
  getDbUrl,
  parseCliArgs,
  parseEventCsvRows,
} from "./lib/events-csv";

config({ path: ".env.local" });
config();

function usageAndExit(code = 1): never {
  console.error(`Usage:
  npm run db:delete-events -- <path/to/events.csv>
  npm run db:delete-events -- check <path/to/events.csv>

Elimina gli eventi che matchano data+lat+lng del CSV
(stesso formato dell'import). Usa "check" per vedere cosa
verrebbe cancellato senza scrivere.

Esempio:
  npm run db:delete-events -- check ./data/storico.csv
  npm run db:delete-events -- ./data/storico.csv`);
  process.exit(code);
}

async function main() {
  const { dryRun, help, filePath } = parseCliArgs(
    process.argv.slice(2).filter(Boolean),
  );

  if (!filePath || help) {
    usageAndExit(filePath && help ? 0 : 1);
  }

  const rows = parseEventCsvRows(filePath);
  console.log(`Letti ${rows.length} eventi da ${filePath}`);

  const url = getDbUrl();
  if (!url) {
    throw new Error(
      "Manca DATABASE_URL / POSTGRES_URL (o DB_POSTGRES_URL) in .env.local",
    );
  }

  const db = drizzle(neon(url));
  let matched = 0;
  let missing = 0;
  let deleted = 0;

  for (const row of rows) {
    const existing = await db
      .select({
        id: events.id,
        titleIt: events.titleIt,
        address: events.address,
      })
      .from(events)
      .where(
        and(
          eq(events.eventDate, row.eventDate),
          eq(events.lat, row.lat),
          eq(events.lng, row.lng),
        ),
      );

    if (existing.length === 0) {
      missing += 1;
      continue;
    }

    matched += existing.length;

    for (const event of existing) {
      console.log(
        `  ${dryRun ? "[check]" : "[delete]"} ${row.eventDate} · ${event.titleIt} · ${event.address ?? "—"}`,
      );
      if (!dryRun) {
        await db.delete(events).where(eq(events.id, event.id));
        deleted += 1;
      }
    }
  }

  if (dryRun) {
    console.log(
      `Check completato: ${matched} da eliminare, ${missing} non trovati in DB. Nessuna cancellazione.`,
    );
    return;
  }

  console.log(
    `Delete completato: ${deleted} eliminati, ${missing} non trovati (stessa data+lat+lng).`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
