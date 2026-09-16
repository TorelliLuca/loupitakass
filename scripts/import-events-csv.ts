import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events, type NewEvent } from "../src/lib/db/schema";
import {
  getDbUrl,
  parseCliArgs,
  parseEventCsvRows,
} from "./lib/events-csv";

config({ path: ".env.local" });
config();

function usageAndExit(code = 1): never {
  console.error(`Usage:
  npm run db:import-events -- <path/to/events.csv>
  npm run db:import-events -- check <path/to/events.csv>

CSV (separatore ';', decimali con ','):
  obbligatori: data;luogo;lat;lng
  opzionale:   titolo (se assente → usa luogo)

Date: DD/MM/YYYY (accetta anche YYYY-MM-DD)
Esempio:
  npm run db:import-events -- ./data/storico.csv
  npm run db:import-events -- check ./data/storico.csv`);
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

  if (dryRun) {
    for (const row of rows.slice(0, 5)) {
      console.log(
        `  [check] ${row.eventDate} · ${row.titleIt} · ${row.address} · (${row.lat}, ${row.lng})`,
      );
    }
    if (rows.length > 5) console.log(`  … e altri ${rows.length - 5}`);
    console.log("Check completato: nessun insert.");
    return;
  }

  const url = getDbUrl();
  if (!url) {
    throw new Error(
      "Manca DATABASE_URL / POSTGRES_URL (o DB_POSTGRES_URL) in .env.local",
    );
  }

  const db = drizzle(neon(url));
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.eventDate, row.eventDate),
          eq(events.lat, row.lat),
          eq(events.lng, row.lng),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    const values: NewEvent = {
      eventDate: row.eventDate,
      address: row.address,
      titleIt: row.titleIt,
      lat: row.lat,
      lng: row.lng,
      status: "published",
    };

    await db.insert(events).values(values);
    inserted += 1;
  }

  console.log(
    `Import completato: ${inserted} inseriti, ${skipped} già presenti (stessa data+lat+lng).`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
