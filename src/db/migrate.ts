/**
 * Skrip migrasi database — bisa dipakai untuk Neon PostgreSQL maupun Postgres lokal.
 *
 * Pemakaian:
 *   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx tsx src/db/migrate.ts
 *
 * Alternatif tanpa Node: jalankan file SQL langsung pada konsol Neon:
 *   psql "$DATABASE_URL" -f drizzle/0000_init_terracyclus.sql
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL belum diisi.");

  const pool = new Pool({ connectionString, ssl: /neon\.tech/.test(connectionString) ? { rejectUnauthorized: false } : undefined });
  const db = drizzle(pool);

  console.log("Menjalankan migrasi dari folder drizzle/ ...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("✅ Migrasi selesai.");

  await pool.end();
}

main().catch((error) => {
  console.error("❌ Migrasi gagal:", error);
  process.exit(1);
});
