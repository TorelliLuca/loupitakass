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
