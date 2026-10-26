import { db } from "@/db";
import {
  crops,
  farms,
  plantFamilies,
  plantings,
  plots,
  soilTests,
} from "@/db/schema";
import { ensureCatalog, ensureProfile } from "@/db/seed";
import {
  daysBetween,
  monthsBetween,
  todayISO,
} from "@/lib/format";
import {
  daysOverdue,
  analyzeRotation,
  expectedHarvest,
} from "@/lib/rotation";
import { soilHealthColor, soilHealthLabel, soilHealthScore } from "@/lib/soil";
import type {
  CropWithFamily,
  DashboardData,
  NextAction,
  NutrientDemand,
  PlantingRecord,
  PlotSummary,
  RotationAnalysis,
  SoilImpact,
  SoilTestRecord,
} from "@/lib/types";
import { and, asc, desc, eq, isNull } from "drizzle-orm";

const num = (value: string | null): number | null =>
  value === null ? null : Number(value);

/* -------------------------------------------------------------------------- */
/*                                  Catalog                                   */
/* -------------------------------------------------------------------------- */

export async function getCrops(): Promise<CropWithFamily[]> {
  await ensureCatalog();
  const rows = await db
    .select({
      id: crops.id,
      commonName: crops.commonName,
      slug: crops.slug,
      nutrientDemand: crops.nutrientDemand,
      soilImpact: crops.soilImpact,
      daysToHarvest: crops.daysToHarvest,
      minPh: crops.minPh,
      maxPh: crops.maxPh,
      emoji: crops.emoji,
      description: crops.description,
      familyId: plantFamilies.id,
      familyName: plantFamilies.name,
      familyLocalName: plantFamilies.localName,
      familyDescription: plantFamilies.description,
      familyPestRisk: plantFamilies.pestRisk,
    })
    .from(crops)
    .innerJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
    .orderBy(asc(plantFamilies.name), asc(crops.commonName));

  return rows.map((row) => ({
    ...row,
    nutrientDemand: row.nutrientDemand as NutrientDemand,
    soilImpact: row.soilImpact as SoilImpact,
    minPh: num(row.minPh),
    maxPh: num(row.maxPh),
  }));
}

export async function getFamilies() {
  await ensureCatalog();
  return db.select().from(plantFamilies).orderBy(asc(plantFamilies.name));
}

/* -------------------------------------------------------------------------- */
/*                              Planting mappers                              */
/* -------------------------------------------------------------------------- */

type PlantingRow = {
  id: number;
  plotId: number;
  cropId: number;
  plantedOn: string;
  harvestedOn: string | null;
  status: string;
  yieldKg: string | null;
  notes: string | null;
  pestNotes: string | null;
  cropCommonName: string;
  cropEmoji: string | null;
  cropNutrientDemand: string;
  cropSoilImpact: string;
  cropDaysToHarvest: number | null;
  familyId: number;
  familyName: string;
  familyLocalName: string | null;
};

function mapPlanting(row: PlantingRow): PlantingRecord {
  return {
    ...row,
    yieldKg: num(row.yieldKg),
    cropNutrientDemand: row.cropNutrientDemand as NutrientDemand,
    cropSoilImpact: row.cropSoilImpact as SoilImpact,
  };
}

const plantingColumns = {
  id: plantings.id,
  plotId: plantings.plotId,
  cropId: plantings.cropId,
  plantedOn: plantings.plantedOn,
  harvestedOn: plantings.harvestedOn,
  status: plantings.status,
  yieldKg: plantings.yieldKg,
  notes: plantings.notes,
  pestNotes: plantings.pestNotes,
  cropCommonName: crops.commonName,
  cropEmoji: crops.emoji,
  cropNutrientDemand: crops.nutrientDemand,
  cropSoilImpact: crops.soilImpact,
  cropDaysToHarvest: crops.daysToHarvest,
  familyId: plantFamilies.id,
  familyName: plantFamilies.name,
  familyLocalName: plantFamilies.localName,
};

export async function getAllPlantings(): Promise<Array<PlantingRecord & { plotName: string; farmName: string }>> {
  const rows = await db
    .select({
      ...plantingColumns,
      plotName: plots.name,
      farmName: farms.name,
    })
    .from(plantings)
    .innerJoin(crops, eq(plantings.cropId, crops.id))
    .innerJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
    .innerJoin(plots, eq(plantings.plotId, plots.id))
    .innerJoin(farms, eq(plots.farmId, farms.id))
    .orderBy(desc(plantings.plantedOn));
  return rows.map((row) => ({
    ...mapPlanting(row),
    plotName: row.plotName,
    farmName: row.farmName,
  }));
}

export async function getPlotPlantings(plotId: number): Promise<PlantingRecord[]> {
  const rows = await db
    .select(plantingColumns)
    .from(plantings)
    .innerJoin(crops, eq(plantings.cropId, crops.id))
    .innerJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
    .where(eq(plantings.plotId, plotId))
    .orderBy(desc(plantings.plantedOn));
  return rows.map(mapPlanting);
}

function mapSoilTest(row: typeof soilTests.$inferSelect): SoilTestRecord {
  return {
    id: row.id,
    plotId: row.plotId,
    testedOn: row.testedOn,
    ph: Number(row.ph),
    n: num(row.n),
    p: num(row.p),
    k: num(row.k),
    organicMatter: num(row.organicMatter),
    notes: row.notes,
  };
}

export async function getPlotSoilTests(plotId: number): Promise<SoilTestRecord[]> {
  const rows = await db
    .select()
    .from(soilTests)
    .where(eq(soilTests.plotId, plotId))
    .orderBy(desc(soilTests.testedOn), desc(soilTests.id));
  return rows.map(mapSoilTest);
}

/* -------------------------------------------------------------------------- */
/*                              Farms and plots                               */
/* -------------------------------------------------------------------------- */

export async function getFarms() {
  const profileId = await ensureProfile();
  const rows = await db
    .select()
    .from(farms)
    .where(eq(farms.ownerId, profileId))
    .orderBy(asc(farms.id));

  const plotRows = await db
    .select()
    .from(plots)
    .orderBy(asc(plots.id));

  return rows.map((farm) => ({
    ...farm,
    plotCount: plotRows.filter((p) => p.farmId === farm.id).length,
    totalArea: plotRows
      .filter((p) => p.farmId === farm.id)
      .reduce((sum, p) => sum + Number(p.area ?? 0), 0),
  }));
}

export async function getFarmById(id: number) {
  const [farm] = await db.select().from(farms).where(eq(farms.id, id));
  if (!farm) return null;
  const plotRows = await db
    .select()
    .from(plots)
    .where(eq(plots.farmId, id))
    .orderBy(asc(plots.id));
  const summaries = await Promise.all(plotRows.map((p) => getPlotSummary(p.id)));
  return { farm, plots: summaries.filter((s): s is PlotSummary => s !== null) };
}

export async function getPlotSummary(plotId: number): Promise<PlotSummary | null> {
  const [row] = await db
    .select({
      plot: plots,
      farmName: farms.name,
    })
    .from(plots)
    .innerJoin(farms, eq(plots.farmId, farms.id))
    .where(eq(plots.id, plotId));
  if (!row) return null;

  const [history, soil] = await Promise.all([
    getPlotPlantings(plotId),
    getPlotSoilTests(plotId),
  ]);

  const activePlanting =
    history.find((p) => p.harvestedOn === null && p.status === "berjalan") ?? null;
  const lastPlanting = history[0] ?? null;
  const latestSoilTest = soil[0] ?? null;
  const score = latestSoilTest ? soilHealthScore(latestSoilTest) : null;

  return {
    id: row.plot.id,
    farmId: row.plot.farmId,
    farmName: row.farmName,
    name: row.plot.name,
    area: num(row.plot.area),
    areaUnit: row.plot.areaUnit,
    soilType: row.plot.soilType,
    notes: row.plot.notes,
    activePlanting,
    lastPlanting,
    latestSoilTest,
    soilHealthScore: score,
    plantingCount: history.length,
    healthLabel: soilHealthLabel(score),
    healthColor: soilHealthColor(score),
  };
}

export async function getPlotRaw(plotId: number) {
  const [row] = await db
    .select({ plot: plots, farmName: farms.name })
    .from(plots)
    .innerJoin(farms, eq(plots.farmId, farms.id))
    .where(eq(plots.id, plotId));
  return row ?? null;
}

/* -------------------------------------------------------------------------- */
/*                            Rotation & dashboard                            */
/* -------------------------------------------------------------------------- */

export async function getRotationAnalysis(plotId: number): Promise<RotationAnalysis | null> {
  const raw = await getPlotRaw(plotId);
  if (!raw) return null;
  const [history, soil, catalog] = await Promise.all([
    getPlotPlantings(plotId),
    getPlotSoilTests(plotId),
    getCrops(),
  ]);
  return analyzeRotation({
    plotId,
    plotName: raw.plot.name,
    crops: catalog,
    history,
    soil: soil[0] ?? null,
  });
}

export async function getDashboard(): Promise<DashboardData> {
  await ensureCatalog();
  const [allPlantings, farmList] = await Promise.all([
    getAllPlantings(),
    db
      .select({ id: farms.id, name: farms.name })
      .from(farms)
      .orderBy(asc(farms.id)),
  ]);
  const plotRows = await db.select().from(plots).orderBy(asc(plots.id));
  const soilByPlot = new Map<number, SoilTestRecord>();
  for (const plot of plotRows) {
    const tests = await getPlotSoilTests(plot.id);
    if (tests[0]) soilByPlot.set(plot.id, tests[0]);
  }

  const today = todayISO();
  const plotNameById = new Map(plotRows.map((p) => [p.id, p.name]));
  const farmNameById = new Map(farmList.map((f) => [f.id, f.name]));

  const active = allPlantings.filter(
    (p) => p.harvestedOn === null && p.status === "berjalan",
  );

  const activePlantings = active
    .map((p) => {
      const expected = expectedHarvest(p.plantedOn, p.cropDaysToHarvest);
      return {
        ...p,
        plotName: plotNameById.get(p.plotId) ?? "Petak",
        farmName: farmNameById.get(
          plotRows.find((pl) => pl.id === p.plotId)?.farmId ?? 0,
        ) ?? "Kebun",
        expectedHarvest: expected,
      };
    })
    .sort((a, b) => (a.expectedHarvest ?? "9999").localeCompare(b.expectedHarvest ?? "9999"));

  const actions: NextAction[] = [];

  // 1. Panen yang jatuh tempo / mendekat
  for (const planting of activePlantings) {
    if (!planting.expectedHarvest) continue;
    const diff = daysBetween(today, planting.expectedHarvest);
    if (diff <= 10) {
      const overdue = daysOverdue(planting.plantedOn, planting.cropDaysToHarvest);
      actions.push({
        id: `panen-${planting.id}`,
        icon: "panen",
        title:
          overdue !== null && overdue > 0
            ? `Panen segera: ${planting.plotName}`
            : `Waktunya panen ${planting.plotName}`,
        detail: `${planting.cropCommonName} siap panen (${planting.cropDaysToHarvest ?? "?"} hari setelah tanam).`,
        href: `/petak/${planting.plotId}`,
        urgency: overdue !== null && overdue > 7 ? "tinggi" : diff <= 0 ? "tinggi" : "sedang",
        dateLabel: planting.expectedHarvest,
      });
    }
  }

  // 2. Petak kosong -> rencanakan rotasi
  const activePlotIds = new Set(active.map((p) => p.plotId));
  for (const plot of plotRows) {
    if (activePlotIds.has(plot.id)) continue;
    actions.push({
      id: `tanam-${plot.id}`,
      icon: "tanam",
      title: `Rencanakan rotasi ${plot.name}`,
      detail: "Petak kosong — lihat rekomendasi tanaman dari mesin rotasi TerraSiklus.",
      href: `/petak/${plot.id}#rotasi`,
      urgency: "sedang",
    });
  }

  // 3. Uji tanah yang sudah lama / tidak ada
  for (const plot of plotRows) {
    const test = soilByPlot.get(plot.id);
    const months = test ? monthsBetween(test.testedOn, today) : null;
    if (!test || (months !== null && months >= 6)) {
      actions.push({
        id: `tanah-${plot.id}`,
        icon: "tanah",
        title: `Uji tanah ${plot.name}`,
        detail: test
          ? `Uji terakhir ${months} bulan lalu (${test.testedOn}). Idealnya uji setiap 6 bulan.`
          : "Belum ada data uji tanah untuk petak ini.",
        href: `/petak/${plot.id}#tanah`,
        urgency: test ? "sedang" : "tinggi",
      });
    } else if (test.ph < 5.5 || test.ph > 7.5) {
      actions.push({
        id: `ph-${plot.id}`,
        icon: "tanah",
        title: `Perbaiki pH ${plot.name}`,
        detail: `pH terukur ${test.ph} di luar rentang ideal 6,0–7,0. Tambahkan dolomit atau bahan organik.`,
        href: `/petak/${plot.id}#tanah`,
        urgency: "tinggi",
      });
    }
  }

  // 4. Catatan hama pada tanaman aktif
  for (const planting of active) {
    if (planting.pestNotes && planting.pestNotes.trim().length > 3) {
      actions.push({
        id: `hama-${planting.id}`,
        icon: "hama",
        title: `Pantau hama di ${plotNameById.get(planting.plotId) ?? "petak"}`,
        detail: planting.pestNotes,
        href: `/petak/${planting.plotId}#riwayat`,
        urgency: "tinggi",
      });
    }
  }

  const urgencyRank = { tinggi: 0, sedang: 1, rendah: 2 };
  actions.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

  const familyCount = new Map<string, number>();
  for (const planting of allPlantings) {
    familyCount.set(planting.familyName, (familyCount.get(planting.familyName) ?? 0) + 1);
  }

  const scores = [...soilByPlot.values()].map((t) => soilHealthScore(t));
  const thisYear = today.slice(0, 4);

  return {
    profileName: "Bu Sari",
    farmCount: farmList.length,
    plotCount: plotRows.length,
    totalArea: plotRows.reduce((sum, p) => sum + Number(p.area ?? 0), 0),
    activePlantings,
    actions: actions.slice(0, 8),
    familyBalance: [...familyCount.entries()]
      .map(([familyName, count]) => ({ familyName, count }))
      .sort((a, b) => b.count - a.count),
    stats: {
      harvestedThisYear: allPlantings.filter(
        (p) => p.harvestedOn && p.harvestedOn.startsWith(thisYear),
      ).length,
      avgSoilHealth:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      plotsIdle: plotRows.length - activePlotIds.size,
    },
  };
}

/** Daftar plot ringkas untuk halaman kebun. */
export async function getAllPlotSummaries(): Promise<PlotSummary[]> {
  const plotRows = await db.select({ id: plots.id }).from(plots).orderBy(asc(plots.id));
  const result: PlotSummary[] = [];
  for (const row of plotRows) {
    const summary = await getPlotSummary(row.id);
    if (summary) result.push(summary);
  }
  return result;
}

export async function getActivePlanting(plotId: number) {
  const [row] = await db
    .select(plantingColumns)
    .from(plantings)
    .where(and(eq(plantings.plotId, plotId), isNull(plantings.harvestedOn)))
    .orderBy(desc(plantings.plantedOn));
  return row ? mapPlanting(row) : null;
}

/** Dipakai route /api/demo untuk mengisi data contoh. */
export async function resetAndSeedDemo() {
  const { seedDemoData } = await import("@/db/seed");
  return seedDemoData();
}
