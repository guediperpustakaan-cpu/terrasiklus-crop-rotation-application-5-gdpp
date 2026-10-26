import { db } from "@/db";
import {
  crops,
  farms,
  plantFamilies,
  plantings,
  plots,
  profiles,
  soilTests,
} from "@/db/schema";
import { CROP_SEED, FAMILY_SEED } from "@/lib/reference-data";
import { asc, sql } from "drizzle-orm";

/** Tanggal sederhana relatif terhadap hari ini (ISO yyyy-mm-dd). */
export function isoDate(daysFromToday: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

/**
 * Memastikan katalog referensi (famili & tanaman) tersedia.
 * Aman dipanggil berkali-kali (idempotent).
 */
export async function ensureCatalog(): Promise<void> {
  const existingFamilies = await db.select().from(plantFamilies);
  const familyIdByName = new Map<string, number>(
    existingFamilies.map((f) => [f.name, f.id]),
  );

  for (const family of FAMILY_SEED) {
    if (!familyIdByName.has(family.name)) {
      const [inserted] = await db
        .insert(plantFamilies)
        .values(family)
        .onConflictDoNothing()
        .returning();
      if (inserted) familyIdByName.set(inserted.name, inserted.id);
      else {
        const [found] = await db
          .select()
          .from(plantFamilies)
          .where(sql`${plantFamilies.name} = ${family.name}`);
        if (found) familyIdByName.set(found.name, found.id);
      }
    }
  }

  const existingCrops = await db.select({ slug: crops.slug }).from(crops);
  const knownSlugs = new Set(existingCrops.map((c) => c.slug));

  const rows = CROP_SEED.filter((c) => !knownSlugs.has(c.slug)).map((c) => ({
    commonName: c.commonName,
    slug: c.slug,
    familyId: familyIdByName.get(c.family)!,
    nutrientDemand: c.nutrientDemand,
    soilImpact: c.soilImpact,
    daysToHarvest: c.daysToHarvest,
    minPh: String(c.minPh),
    maxPh: String(c.maxPh),
    emoji: c.emoji,
    description: c.description,
  }));

  if (rows.length > 0) {
    await db.insert(crops).values(rows).onConflictDoNothing();
  }
}

/** Profil aktif tunggal untuk aplikasi single-user ini. */
export async function ensureProfile(): Promise<number> {
  const existing = await db
    .select()
    .from(profiles)
    .orderBy(asc(profiles.id))
    .limit(1);
  if (existing.length > 0) return existing[0].id;

  const [created] = await db
    .insert(profiles)
    .values({ username: "petani-demo", fullName: "Bu Sari" })
    .returning();
  return created.id;
}

const DEMO = {
  profile: { username: "petani-demo", fullName: "Bu Sari" },
  farms: [
    {
      name: "Kebun Bu Sari",
      location: "Batu, Jawa Timur",
      description:
        "Kebun sayur keluarga seluas 600 m² dengan 4 petak rotasi musiman.",
      plots: [
        { name: "Petak A – Sawah Kering", area: "120.00", soilType: "Liat berpasir", notes: "Drainase baik, terkena matahari pagi." },
        { name: "Petak B – Belakang Rumah", area: "90.00", soilType: "Alluvial", notes: "Paling subur, dekat sumber air." },
        { name: "Petak C – Tepi Kolam", area: "75.00", soilType: "Lempung", notes: "Cenderung lembap, cocok kangkung & daun." },
        { name: "Petak D – Teras Hijau", area: "60.00", soilType: "Pasir berhumus", notes: "Petak baru, sedang diperbaiki bahan organiknya." },
      ],
    },
    {
      name: "Kebun Kader Desa",
      location: "Kediri, Jawa Timur",
      description: "Kebun komunal dengan 2 petak eksperimen rotasi.",
      plots: [
        { name: "Petak Komunal 1", area: "150.00", soilType: "Regosol", notes: "Dikelola bersama kader desa." },
      ],
    },
  ],
};

/**
 * Mengisi data contoh (kebun, petak, riwayat tanam, uji tanah)
 * hanya jika belum ada kebun sama sekali.
 */
export async function seedDemoData(): Promise<{ created: boolean }> {
  await ensureCatalog();
  const profileId = await ensureProfile();

  const existingFarms = await db.select({ id: farms.id }).from(farms).limit(1);
  if (existingFarms.length > 0) return { created: false };

  const catalog = await db
    .select({
      id: crops.id,
      slug: crops.slug,
      familyId: crops.familyId,
      daysToHarvest: crops.daysToHarvest,
    })
    .from(crops);
  const cropBySlug = new Map(catalog.map((c) => [c.slug, c]));

  for (const farm of DEMO.farms) {
    const [createdFarm] = await db
      .insert(farms)
      .values({
        ownerId: profileId,
        name: farm.name,
        location: farm.location,
        description: farm.description,
      })
      .returning();

    for (const plot of farm.plots) {
      const [createdPlot] = await db
        .insert(plots)
        .values({
          farmId: createdFarm.id,
          name: plot.name,
          area: plot.area,
          soilType: plot.soilType,
          notes: plot.notes,
        })
        .returning();

      await db.insert(soilTests).values([
        {
          plotId: createdPlot.id,
          testedOn: isoDate(-150),
          ph: "6.2",
          n: "18.00",
          p: "12.00",
          k: "9.50",
          organicMatter: "2.60",
          notes: "Uji tanah awal sebelum musim pertama.",
        },
        {
          plotId: createdPlot.id,
          testedOn: isoDate(-20),
          ph: "6.4",
          n: "14.00",
          p: "10.50",
          k: "7.20",
          organicMatter: "3.10",
          notes: "Nitrogen turun setelah panen daun.",
        },
      ]);
    }
  }

  const farmRows = await db.select().from(farms).orderBy(asc(farms.id));
  const plotRows = await db.select().from(plots).orderBy(asc(plots.id));

  const firstFarmPlots = plotRows.filter(
    (p) => p.farmId === farmRows[0]?.id,
  );

  const history: Array<{ slug: string; start: number; end: number | null; pest: string | null; plotIndex: number }> = [
    { slug: "tomat", start: -220, end: -150, pest: "Lalat buah menyerang 30% panen.", plotIndex: 0 },
    { slug: "kacang-panjang", start: -140, end: -80, pest: null, plotIndex: 0 },
    { slug: "sawi-hijau", start: -70, end: -25, pest: "Sedikit ulat krop, dikendalikan dengan neem.", plotIndex: 0 },
    { slug: "kubis-kol", start: -200, end: -110, pest: "Ulat krop hebat, tanah jadi asam.", plotIndex: 1 },
    { slug: "wortel", start: -100, end: -30, pest: null, plotIndex: 1 },
    { slug: "kangkung-darat", start: -20, end: null, pest: null, plotIndex: 1 },
    { slug: "cabai-merah", start: -180, end: -95, pest: "Layu fusarium pada 5 tanaman.", plotIndex: 2 },
    { slug: "jagung-manis", start: -85, end: -10, pest: null, plotIndex: 2 },
    { slug: "bayam-hijau", start: -45, end: -18, pest: null, plotIndex: 3 },
    { slug: "kacang-hijau", start: -15, end: null, pest: null, plotIndex: 3 },
  ];

  for (const row of history) {
    const crop = cropBySlug.get(row.slug);
    const plot = firstFarmPlots[row.plotIndex];
    if (!crop || !plot) continue;
    await db.insert(plantings).values({
      plotId: plot.id,
      cropId: crop.id,
      plantedOn: isoDate(row.start),
      harvestedOn: row.end === null ? null : isoDate(row.end),
      status: row.end === null ? "berjalan" : "panen",
      notes:
        row.end === null
          ? "Musim tanam sedang berjalan."
          : `Panen selesai dalam ${row.end - row.start} hari.`,
      pestNotes: row.pest,
    });
  }

  return { created: true };
}
