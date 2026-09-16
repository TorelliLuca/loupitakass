import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DB_DATABASE_URL ??
  process.env.DB_POSTGRES_URL;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // generate non richiede DB live; migrate/push sì
    url: url ?? "postgresql://user:pass@localhost:5432/loupitakass",
  },
  strict: true,
  verbose: true,
});
