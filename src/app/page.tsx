import {
  ArrowRight,
  Bug,
  CalendarClock,
  FlaskConical,
  Leaf,
  Recycle,
  Sparkles,
  Sprout,
  Tractor,
  Trees,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: Recycle,
    title: "Mesin Rotasi Tanam",
    description:
      "Analisis famili botani dari musim sebelumnya dan rekomendasikan tanaman dari famili berbeda beserta alasannya.",
  },
  {
    icon: Bug,
    title: "Peringatan Hama",
    description:
      "TerraSiklus memperingatkan Anda bila famili yang sama ditanam terlalu cepat di petak yang sama.",
  },
  {
    icon: FlaskConical,
    title: "Pemantau Kesehatan Tanah",
    description:
      "Catat pH, N, P, K, dan bahan organik lalu lihat skor kesehatan tanah serta saran perbaikannya.",
  },
  {
    icon: CalendarClock,
    title: "Daftar Aksi Berikutnya",
    description:
      "Dasbor menyusun prioritas: waktunya panen, petak kosong, atau tanah yang perlu diuji ulang.",
  },
];

const STEPS = [
  {
    title: "Buat kebun & petak",
    body: "Daftarkan kebun Anda lalu bagi menjadi beberapa petak dengan luas dan jenis tanah masing-masing.",
  },
  {
    title: "Catat riwayat tanam",
    body: "Isi tanaman, tanggal tanam, tanggal panen, dan catatan hama untuk setiap musim.",
  },
  {
    title: "Terima rekomendasi",
    body: "Mesin rotasi memberi skor setiap tanaman kandidat lengkap dengan alasan agronomisnya.",
  },
  {
    title: "Uji & perbaiki tanah",
    body: "Masukkan hasil uji tanah untuk menyempurnakan rekomendasi rotasi berikutnya.",
  },
];

const FAMILIES = [
  { name: "Solanaceae", id: "Terung-terungan", emoji: "🍅" },
  { name: "Fabaceae", id: "Polong-polongan", emoji: "🫛" },
  { name: "Brassicaceae", id: "Kubis-kubisan", emoji: "🥬" },
  { name: "Cucurbitaceae", id: "Labu-labuan", emoji: "🥒" },
  { name: "Poaceae", id: "Rumput-rumputan", emoji: "🌽" },
  { name: "Amaryllidaceae", id: "Bawang-bawangan", emoji: "🧅" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-soil-100/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-soil-900">
              TerraSiklus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/katalog" className="btn-ghost hidden sm:inline-flex">
              Katalog Tanaman
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Buka Dasbor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="chip bg-leaf-100 text-leaf-800">
              <Sparkles className="h-3.5 w-3.5" /> Rotasi pintar untuk petani kecil
            </span>
            <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold tracking-tight text-soil-900 sm:text-4xl lg:text-5xl">
              Panen lebih banyak dengan{" "}
              <span className="text-leaf-600">rotasi tanam</span> yang benar.
            </h1>
            <p className="mt-4 max-w-xl text-base text-soil-600 sm:text-lg">
              TerraSiklus membantu petani kecil dan pecinta kebun rumah merencanakan
              musim tanam berdasarkan <strong>famili botani</strong> dan{" "}
              <strong>riwayat tanah</strong> — memutus siklus hama dan menjaga kesuburan
              tanah secara alami.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="btn-primary px-5 py-3 text-base">
                Mulai Gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/katalog" className="btn-secondary px-5 py-3 text-base">
                Lihat Katalog Tanaman
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
              {[
                { value: "45+", label: "Tanaman katalog" },
                { value: "15", label: "Famili botani" },
                { value: "4", label: "Aturan rotasi" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/70 p-3 text-center ring-1 ring-soil-100">
                  <dt className="text-xl font-extrabold text-leaf-700 sm:text-2xl">
                    {stat.value}
                  </dt>
                  <dd className="text-[11px] font-semibold text-soil-500 sm:text-xs">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-soil-100 shadow-[0_30px_60px_-30px_rgba(76,53,38,0.45)]">
              <Image
                src="/images/hero-kebun.jpg"
                alt="Kebun sayur dengan petak-petak rotasi tanam"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-soil-900/80 to-transparent p-5 pt-14">
                <p className="text-sm font-semibold text-white">
                  4 petak · 15 famili · 3 musim tanam
                </p>
                <p className="text-xs text-leaf-100">
                  Contoh: Tomat (Solanaceae) → Kacang Panjang (Fabaceae) → Sawi
                  (Brassicaceae)
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-soil-100 sm:block">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Bug className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-soil-800">Peringatan rotasi</p>
                  <p className="text-[10px] text-soil-500">Famili sama &lt; 12 bulan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold tracking-[0.18em] text-leaf-600 uppercase">
            Fitur Utama
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-soil-900 sm:text-3xl">
            Semua yang dibutuhkan kebun Anda, dalam satu tempat
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card card-hover p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-soil-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-soil-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Families */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.18em] text-leaf-600 uppercase">
                Fondasi Ilmiah
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-soil-900 sm:text-3xl">
                Dikelompokkan berdasarkan famili botani
              </h2>
              <p className="mt-2 text-sm text-soil-500 sm:text-base">
                Tanaman dalam satu famili berbagi hama dan kebutuhan hara yang sama. Itu
                sebabnya TerraSiklus selalu meminta Anda berganti famili antar musim.
              </p>
            </div>
            <Link href="/katalog" className="btn-secondary">
              Jelajahi 45 tanaman <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FAMILIES.map((family) => (
              <div
                key={family.name}
                className="rounded-2xl border border-soil-100 bg-cream p-4 text-center transition hover:border-leaf-200 hover:bg-leaf-50"
              >
                <span className="text-2xl">{family.emoji}</span>
                <p className="mt-2 text-xs font-bold text-soil-800">{family.name}</p>
                <p className="text-[10px] text-soil-500">{family.id}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-leaf-600 uppercase">
              Alur Kerja
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-soil-900 sm:text-3xl">
              Dari petak kosong ke rencana musim berikutnya
            </h2>
            <p className="mt-3 text-sm text-soil-600 sm:text-base">
              Empat langkah sederhana, cukup 5 menit per musim tanam.
            </p>
            <Link href="/dashboard" className="btn-primary mt-6">
              <Tractor className="h-4 w-4" /> Mulai catat kebun saya
            </Link>
          </div>
          <ol className="space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card flex gap-4 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-600 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-soil-900">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-soil-500">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-700 via-leaf-600 to-leaf-800 px-6 py-12 text-center text-white sm:px-12">
          <Trees className="mx-auto mb-4 h-10 w-10 text-leaf-200" />
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Siap memutus siklus hama di kebun Anda?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-leaf-50/90 sm:text-base">
            Data contoh sudah tersedia sehingga Anda bisa langsung melihat cara mesin
            rotasi TerraSiklus bekerja.
          </p>
          <Link
            href="/dashboard"
            className="btn mt-7 bg-white px-6 py-3 text-base text-leaf-800 hover:bg-leaf-50"
          >
            <Sprout className="h-4 w-4" /> Buka Dasbor TerraSiklus
          </Link>
        </div>
      </section>

      <footer className="border-t border-soil-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-600 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-soil-800">TerraSiklus</span>
          </div>
          <p className="text-xs text-soil-400">
            Dibangun untuk petani kecil &amp; kebun rumah Indonesia · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
