# Lou Pitakass — sito ufficiale

One-page + admin eventi. Stack: Next.js, Tailwind, shadcn/ui, next-intl (IT/FR/EN/OC), Drizzle, Vercel Postgres, Vercel Blob.

## Setup locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Lingue

| Prefisso | Lingua |
|----------|--------|
| `/` (default) | Italiano |
| `/fr` | Français |
| `/en` | English |
| `/oc` | Occitan |

I testi OC (e dove manca copy) si completano in `src/messages/*.json` e nei campi admin.

## Media

- Brand/hero/membri statici → `public/images/`
- Volantini eventi (upload admin) → Vercel Blob (`BLOB_READ_WRITE_TOKEN`)

## Dominio

Produzione: [loupitakass.com](https://loupitakass.com)

## Database (Drizzle + Vercel Postgres)

**Drizzle** = ORM TypeScript: schema in codice (`src/lib/db/schema.ts`), query tipizzate, migrazioni SQL.

Tabelle: `users` (admin), `members`, `events` — volume atteso ≪ free tier (Hobby Neon/Vercel Postgres ≈ **$0** per questo carico).

```bash
# 1. Crea DB su Vercel → Storage → Postgres, copia DATABASE_URL in .env.local
# 2. Genera e applica schema
npm run db:generate
npm run db:push          # rapido in dev; oppure db:migrate in prod
npm run db:seed          # dati di prova
npm run db:import-events -- ./path/storico.csv         # CSV: data;luogo;lat;lng
npm run db:import-events -- check ./path/storico.csv   # solo validazione
npm run db:delete-events -- check ./path/storico.csv   # anteprima delete
npm run db:delete-events -- ./path/storico.csv         # undo import (data+lat+lng)
npm run db:studio        # UI tabellare opzionale
```

Import/delete storico: CSV con `;`, decimali con `,`, header `data;luogo;lat;lng` + `titolo` opzionale. Date in `DD/MM/YYYY`. Esempio: `scripts/data/events-import.example.csv`. Match su `data+lat+lng`.
