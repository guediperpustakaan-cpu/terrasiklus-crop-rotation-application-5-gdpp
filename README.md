# TerraSiklus

Aplikasi rotasi tanam & pemantau kesehatan tanah untuk petani kecil dan kebun rumah.

## Tech Stack
- Next.js 16 (App Router)
- PostgreSQL (Neon) via Drizzle ORM
- Tailwind CSS 4

## Setup
1. Clone repository.
2. `npm install`
3. Buat `.env.local` dengan `DATABASE_URL=...`
4. `npm run build` / `npm run dev`
5. Migrasi: `npx tsx src/db/migrate.ts`
6. Seed demo: `POST /api/demo`

## Deploy (Vercel)
Set `DATABASE_URL` di environment Vercel. Jalankan migrasi ke Neon sebelum deploy.

## Download Source Code
Source code lengkap tersedia di repository ini.

## Open Source oleh MZF - 2026
Lisensi open source. Kontribusi dipersilakan.
