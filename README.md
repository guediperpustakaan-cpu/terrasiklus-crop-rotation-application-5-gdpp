# 🌱 TerraSiklus

**Kalkulator rotasi tanam & pemantau kesehatan tanah** untuk petani kecil dan kebun rumah.
Semua antarmuka memakai **Bahasa Indonesia** dengan estetika *nature-inspired* (hijau daun, cokelat tanah, putih lembut).

---

## ✨ Fitur

| Modul | Keterangan |
| --- | --- |
| **Kebun & Petak** | Buat kebun (`farms`), tambah petak (`plots`) lengkap dengan luas + jenis tanah. |
| **Katalog Tanaman** | 45 tanaman hortikultura Indonesia dalam 15 famili botani, lengkap kebutuhan hara, dampak ke tanah, pH ideal, dan hama khas famili. |
| **Riwayat Tanam** | Catat tanaman, tanggal tanam/panen, hasil panen, serta catatan hama/penyakit per petak. |
| **Mesin Rotasi (core)** | Memberi skor 0–100 untuk setiap kandidat tanaman + alasan agronomis dalam Bahasa Indonesia, dan memperingatkan bila famili sama ditanam terlalu cepat. |
| **Pemantau Kesehatan Tanah** | Form uji tanah (pH, N, P, K, bahan organik), skor kesehatan tanah, saran perbaikan, dan riwayat uji. |
| **Dasbor Interaktif** | Statistik kebun, tanaman aktif + prediksi panen, daftar “Aksi Berikutnya”, dan keseimbangan famili botani. |

## 🧠 Aturan Mesin Rotasi

1. **Famili berbeda** — tanaman dari famili yang sama dengan musim terakhir diberi penalti besar (-55) karena hama & patogen famili itu masih hidup di tanah.
2. **Jeda 12 bulan** — famili yang sama baru boleh kembali setelah 12 bulan (`< 6 bulan` = bahaya, `6–12 bulan` = perlu pertimbangan).
3. **Keseimbangan hara** — setelah tanaman berat (hara tinggi) sistem mendorong Fabaceae/pembenah tanah (+18), dan memperingatkan dua tanaman berat berturut-turut (-12).
4. **Kesesuaian pH & hara tanah** — hasil uji tanah terbaru dipakai untuk menyesuaikan skor (pH di luar rentang ideal tanaman = penalti).

Kategori hasil: `Disarankan` (≥70), `Perlu Pertimbangan` (45–69), `Hindari` (<45). Setiap skor disertai daftar alasan (`positif / peringatan / bahaya / info`).

## 🗄️ Skema Database (PostgreSQL / Neon)

`profiles` · `farms` · `plots` · `plant_families` · `crops` · `plantings` · `soil_tests`

```
profiles 1─┬─* farms 1─* plots 1─┬─* plantings *─1 crops *─1 plant_families
           │                     └─* soil_tests
```

Definisi lengkap: `src/db/schema.ts` · SQL migrasi: `drizzle/0000_init_terracyclus.sql`

### Menyiapkan database Neon

```bash
# 1. set koneksi
export DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. buat tabel (pilih salah satu)
npx drizzle-kit push                      # langsung sinkron dari schema.ts
DATABASE_URL="$DATABASE_URL" npx tsx src/db/migrate.ts   # via migrasi SQL
psql "$DATABASE_URL" -f drizzle/0000_init_terracyclus.sql
```

Katalog famili/tanaman & data contoh (2 kebun, 5 petak, 10 riwayat tanam, 10 uji tanah) diisi otomatis
oleh `ensureCatalog()` / tombol **Muat Data Contoh** di dasbor (`POST /api/demo`).

## 🔌 API

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET/POST | `/api/farms` | Daftar & buat kebun |
| GET/PATCH/DELETE | `/api/farms/:id` | Detail/ubah/hapus kebun |
| GET/POST | `/api/plots` | Daftar petak (ringkasan + skor tanah) & buat petak |
| GET/PATCH/DELETE | `/api/plots/:id` | Detail petak (riwayat, uji tanah, analisis rotasi) |
| GET | `/api/crops` | Katalog tanaman (`?family=`, `?q=`) |
| GET/POST/DELETE | `/api/plantings` | Riwayat tanam; POST mengembalikan penilaian rotasi |
| PATCH/DELETE | `/api/plantings/:id` | Catat panen / hapus riwayat |
| GET/POST/DELETE | `/api/soil-tests` | Uji tanah (`?plotId=`) |
| GET | `/api/recommendations?plotId=` | Hasil mesin rotasi (`?cropId=` untuk satu pilihan) |
| GET | `/api/dashboard` | Data dasbor + daftar aksi berikutnya |
| POST | `/api/demo` | Muat data contoh |

## 🧱 Teknologi

- **React 19 + TypeScript** dengan **Next.js App Router** (server components untuk data, client components untuk interaksi).
- **Tailwind CSS v4** dengan design token kustom (`leaf`, `soil`, `cream`).
- **Lucide React** untuk ikonografi.
- **TanStack Query** untuk fetching, caching, dan invalidasi data.
- **Drizzle ORM + PostgreSQL (Neon-ready)**.

## 🗂️ Struktur Komponen

```
src/components/
├── app-shell.tsx        Layout responsif (sidebar + bottom nav mobile)
├── plot-card.tsx        Kartu petak: tanaman aktif, progres panen, skor tanah
├── rotation-engine.tsx  Panel rekomendasi + alasan per tanaman
├── planting-form.tsx    Modal catat penanaman (dengan peringatan rotasi) & modal panen
├── soil-form.tsx        Form uji tanah + pratinjau skor langsung
├── plot-form-modal.tsx  Form tambah petak
└── ui.tsx               Design system (Card, Modal, Chip, MeterBar, ScoreRing, Toast, …)
```

## 🚀 Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```
