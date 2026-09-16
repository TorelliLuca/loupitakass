import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events, members, users } from "../src/lib/db/schema";
import { demoMembers } from "../src/lib/public-data";

/** Password demo locale: `giocoso` — solo per sviluppo / seed. */
const DEMO_PASSWORD_HASH =
  "$2b$12$bsAO1f/Q.NpkNcu0L4tqP.Mu0tLXG5w92nQvOb6Y1TUwjhYakJmv2";
const DEMO_ADMIN_EMAIL = "admin@loupitakass.com";

config({ path: ".env.local" });
config();

/**
 * Seed di prova — esegui solo con DATABASE_URL impostato:
 *   npm run db:seed
 */
async function main() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DB_DATABASE_URL ??
    process.env.DB_POSTGRES_URL;
  if (!url) {
    throw new Error(
      "Manca DATABASE_URL / POSTGRES_URL (o DB_POSTGRES_URL) in .env.local",
    );
  }

  const db = drizzle(neon(url));

  const adminEmail = process.env.ADMIN_EMAIL ?? DEMO_ADMIN_EMAIL;
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH ?? DEMO_PASSWORD_HASH;

  await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: "Admin",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: adminPasswordHash,
        name: "Admin",
      },
    });

  await db.insert(members).values(
    demoMembers.map(
      ({
        sortOrder,
        firstName,
        lastName,
        roleIt,
        roleFr,
        roleEn,
        roleOc,
        bioIt,
        bioFr,
        bioEn,
        bioOc,
        photoUrl,
      }) => ({
        sortOrder,
        firstName,
        lastName,
        roleIt,
        roleFr,
        roleEn,
        roleOc,
        bioIt,
        bioFr,
        bioEn,
        bioOc,
        photoUrl,
      }),
    ),
  );

  const today = new Date();
  const future = new Date(today);
  future.setMonth(future.getMonth() + 1);
  const past = new Date(today);
  past.setMonth(past.getMonth() - 2);

  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  await db.insert(events).values([
    {
      eventDate: toDate(future),
      eventTime: "21:00",
      venue: "Sala prova",
      city: "Torino",
      country: "Italia",
      lat: 45.0703,
      lng: 7.6869,
      titleIt: "Concerto di prova (futuro)",
      titleFr: "Concert test (futur)",
      titleEn: "Test concert (upcoming)",
      titleOc: "Concèrt de pròva (futur)",
      status: "published",
    },
    {
      eventDate: toDate(past),
      eventTime: "20:30",
      venue: "Piazza esempio",
      city: "Cuneo",
      country: "Italia",
      lat: 44.3842,
      lng: 7.5427,
      titleIt: "Concerto di prova (passato)",
      titleFr: "Concert test (passé)",
      titleEn: "Test concert (past)",
      titleOc: "Concèrt de pròva (passat)",
      status: "published",
    },
  ]);

  console.log(
    `Seed completato: admin ${adminEmail} (password demo: giocoso se non impostata in env), 6 members, 2 events.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
