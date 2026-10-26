import {
  monthsBetween,
  todayISO,
  addDaysISO,
  daysBetween,
} from "@/lib/format";
import { soilHealthScore, soilInsights } from "@/lib/soil";
import type {
  CropWithFamily,
  FamilyUsage,
  PlantingRecord,
  RecommendationStatus,
  RotationAnalysis,
  RotationRecommendation,
  RotationReason,
} from "@/lib/types";

/** Jarak minimal (bulan) sebelum famili yang sama boleh kembali ke petak yang sama. */
export const IDEAL_FAMILY_GAP_MONTHS = 12;
export const WARNING_FAMILY_GAP_MONTHS = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function statusFor(score: number): RecommendationStatus {
  if (score >= 70) return "disarankan";
  if (score >= 45) return "hati-hati";
  return "hindari";
}

export function statusMeta(status: RecommendationStatus): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case "disarankan":
      return {
        label: "Disarankan",
        color: "#15803d",
        bg: "#dcfce7",
        border: "#86efac",
      };
    case "hati-hati":
      return {
        label: "Perlu Pertimbangan",
        color: "#a16207",
        bg: "#fef3c7",
        border: "#fde047",
      };
    default:
      return {
        label: "Hindari",
        color: "#b91c1c",
        bg: "#fee2e2",
        border: "#fca5a5",
      };
  }
}

export interface RotationInput {
  plotId: number;
  plotName: string;
  crops: CropWithFamily[];
  history: PlantingRecord[];
  soil: RotationAnalysis["soil"];
  evaluatedOn?: string;
}

/**
 * Mesin rotasi TerraSiklus.
 * Aturan inti:
 *  1. Famili tanaman berbeda dari musim sebelumnya (memutus siklus hama).
 *  2. Jeda minimal 12 bulan untuk famili yang sama di petak yang sama.
 *  3. Keseimbangan hara: tanaman berat diikuti tanaman ringan/pembenah.
 *  4. Kesesuaian pH tanah hasil uji tanah terbaru.
 */
export function analyzeRotation(input: RotationInput): RotationAnalysis {
  const today = input.evaluatedOn ?? todayISO();

  const sorted = [...input.history].sort((a, b) =>
    b.plantedOn.localeCompare(a.plantedOn),
  );
  const activePlanting =
    sorted.find((p) => p.harvestedOn === null && p.status === "berjalan") ?? null;
  const lastCompleted = sorted.find((p) => p.harvestedOn !== null) ?? null;
  const reference = activePlanting ?? lastCompleted;

  // ---- Riwayat pemakaian famili di petak ini -------------------------------
  const familyMap = new Map<number, FamilyUsage>();
  for (const crop of input.crops) {
    if (!familyMap.has(crop.familyId)) {
      familyMap.set(crop.familyId, {
        familyId: crop.familyId,
        familyName: crop.familyName,
        lastPlantedOn: null,
        timesPlanted: 0,
        monthsSince: null,
        hadPestIssue: false,
      });
    }
  }
  for (const planting of input.history) {
    const entry = familyMap.get(planting.familyId);
    if (!entry) continue;
    entry.timesPlanted += 1;
    if (!entry.lastPlantedOn || planting.plantedOn > entry.lastPlantedOn) {
      entry.lastPlantedOn = planting.plantedOn;
    }
    if (planting.pestNotes && planting.pestNotes.trim().length > 2) {
      entry.hadPestIssue = true;
    }
  }
  for (const entry of familyMap.values()) {
    entry.monthsSince = entry.lastPlantedOn
      ? monthsBetween(entry.lastPlantedOn, today)
      : null;
  }

  const soilInsightList = input.soil ? soilInsights(input.soil) : [];
  const soilScore = input.soil ? soilHealthScore(input.soil) : null;

  const recommendations: RotationRecommendation[] = input.crops.map((crop) => {
    const reasons: RotationReason[] = [];
    let score = 55;

    // --- ATURAN 1: famili berbeda dari musim terakhir ----------------------
    if (!reference) {
      score += 15;
      reasons.push({
        kind: "positif",
        label: "Petak ini belum punya riwayat tanam — bebas memilih tanaman manapun.",
      });
    } else if (crop.familyId === reference.familyId) {
      score -= 55;
      reasons.push({
        kind: "bahaya",
        label: `Sama famili dengan musim terakhir (${reference.cropCommonName} — famili ${reference.familyName}). Hama & penyakit khas famili ini masih hidup di tanah.`,
      });
      const gap = reference.plantedOn ? monthsBetween(reference.plantedOn, today) : 0;
      if (gap < 6) {
        score -= 12;
        reasons.push({
          kind: "bahaya",
          label: `Baru ${gap} bulan sejak penanaman terakhir famili ini — risiko infeksi ulang sangat tinggi.`,
        });
      } else {
        score -= 4;
        reasons.push({
          kind: "peringatan",
          label: `Sudah ${gap} bulan, tetapi patogen famili ${crop.familyName} bisa bertahan 2–3 tahun di tanah.`,
        });
      }
    } else {
      score += 20;
      reasons.push({
        kind: "positif",
        label: `Keluarga tanaman berbeda (${reference.familyName} → ${crop.familyName}). Rotasi ini memutus siklus hama dan penyakit.`,
      });
    }

    // --- ATURAN 2: jeda famili yang sama di petak yang sama ----------------
    const usage = familyMap.get(crop.familyId);
    if (usage && usage.timesPlanted > 0) {
      const monthsSince = usage.monthsSince ?? 0;
      if (monthsSince < WARNING_FAMILY_GAP_MONTHS) {
        score -= 25;
        reasons.push({
          kind: "bahaya",
          label: `Famili ${crop.familyName} baru ditanam ${monthsSince} bulan lalu di petak ini. Idealnya tunggu minimal ${IDEAL_FAMILY_GAP_MONTHS} bulan.`,
        });
      } else if (monthsSince < IDEAL_FAMILY_GAP_MONTHS) {
        score -= 8;
        reasons.push({
          kind: "peringatan",
          label: `Famili ${crop.familyName} terakhir ditanam ${monthsSince} bulan lalu — masih sedikit di bawah jeda ideal ${IDEAL_FAMILY_GAP_MONTHS} bulan.`,
        });
      } else {
        score += 6;
        reasons.push({
          kind: "positif",
          label: `Sudah ${monthsSince} bulan sejak famili ${crop.familyName} ditanam di petak ini — jeda rotasi terpenuhi.`,
        });
      }
      if (usage.hadPestIssue && crop.familyId === reference?.familyId) {
        score -= 10;
        reasons.push({
          kind: "bahaya",
          label: `Riwayat catatan hama pada famili ini sebelumnya. Menanam ulang akan memperbesar tekanan hama.`,
        });
      }
    } else {
      score += 8;
      reasons.push({
        kind: "positif",
        label: `Famili ${crop.familyName} belum pernah ditanam di petak ini — menambah keanekaragaman hayati petak.`,
      });
    }

    // --- ATURAN 3: keseimbangan hara --------------------------------------
    if (reference) {
      if (reference.cropNutrientDemand === "tinggi") {
        if (crop.soilImpact === "pembenah") {
          score += 18;
          reasons.push({
            kind: "positif",
            label:
              "Musim sebelumnya tanaman berat. Kacang-kacangan mengembalikan nitrogen ke tanah lewat simpul akarnya.",
          });
        } else if (crop.nutrientDemand === "tinggi") {
          score -= 12;
          reasons.push({
            kind: "peringatan",
            label:
              "Dua tanaman berat berturut-turut akan menguras nitrogen & fosfor tanah secara cepat.",
          });
        } else {
          reasons.push({
            kind: "info",
            label:
              "Kebutuhan hara sedang — aman, tetap tambahkan kompos 2 kg/m² sebelum tanam.",
          });
        }
      } else if (
        reference.cropNutrientDemand === "rendah" ||
        reference.cropSoilImpact === "pembenah"
      ) {
        if (crop.nutrientDemand === "tinggi") {
          score += 12;
          reasons.push({
            kind: "positif",
            label:
              "Tanah sudah 'beristirahat' pada tanaman ringan/pembenah, sehingga siap untuk tanaman berat seperti ini.",
          });
        } else {
          score += 4;
          reasons.push({
            kind: "info",
            label: "Beban hara ringan setelah tanaman ringan — petak akan sangat sehat.",
          });
        }
      }
    }

    // --- ATURAN 4: kesesuaian pH tanah ------------------------------------
    if (input.soil) {
      const ph = input.soil.ph;
      const min = crop.minPh;
      const max = crop.maxPh;
      if (min !== null && max !== null) {
        if (ph >= min && ph <= max) {
          score += 8;
          reasons.push({
            kind: "positif",
            label: `pH tanah ${ph} berada dalam rentang ideal tanaman ini (${min}–${max}).`,
          });
        } else if (ph < min - 0.7 || ph > max + 0.7) {
          score -= 12;
          reasons.push({
            kind: "peringatan",
            label: `pH tanah ${ph} tidak cocok (ideal ${min}–${max}). Perbaiki pH dulu sebelum menanam.`,
          });
        } else {
          score -= 3;
          reasons.push({
            kind: "info",
            label: `pH tanah ${ph} sedikit di luar rentang ideal ${min}–${max}, namun masih toleran.`,
          });
        }
      }
      if (input.soil.n !== null && input.soil.n < 15 && crop.nutrientDemand === "tinggi") {
        score -= 8;
        reasons.push({
          kind: "peringatan",
          label: `Nitrogen tanah hanya ${input.soil.n} ppm, sedangkan tanaman ini butuh nitrogen tinggi.`,
        });
      }
      if (input.soil.organicMatter !== null && input.soil.organicMatter < 2 && crop.nutrientDemand === "tinggi") {
        score -= 5;
        reasons.push({
          kind: "peringatan",
          label: "Bahan organik rendah; tanaman berat akan kesulitan di tanah ini tanpa kompos.",
        });
      }
      if (soilScore !== null && soilScore >= 75) {
        score += 4;
      }
    }

    // --- Catatan catatan tambahan -----------------------------------------
    if (crop.soilImpact === "pembenah") {
      reasons.push({
        kind: "info",
        label:
          "Tanaman pembenah tanah: menyimpan nitrogen di simpul akar, bagus untuk pemulihan petak.",
      });
    }
    if (crop.daysToHarvest && crop.daysToHarvest <= 45) {
      reasons.push({
        kind: "info",
        label: `Panen cepat (${crop.daysToHarvest} hari) — cocok sebagai tanaman pengisi antar musim.`,
      });
    }

    const finalScore = clamp(Math.round(score), 0, 100);
    return {
      cropId: crop.id,
      cropName: crop.commonName,
      emoji: crop.emoji,
      familyName: crop.familyName,
      familyLocalName: crop.familyLocalName,
      nutrientDemand: crop.nutrientDemand,
      soilImpact: crop.soilImpact,
      daysToHarvest: crop.daysToHarvest,
      score: finalScore,
      status: statusFor(finalScore),
      reasons,
    };
  });

  recommendations.sort((a, b) => b.score - a.score);

  const counts: Record<RecommendationStatus, number> = {
    disarankan: 0,
    "hati-hati": 0,
    hindari: 0,
  };
  for (const rec of recommendations) counts[rec.status] += 1;

  const headline = buildHeadline(reference, activePlanting);
  const explanation = buildExplanation(reference, input.plotName);

  return {
    plotId: input.plotId,
    plotName: input.plotName,
    evaluatedOn: today,
    lastCompleted: lastCompleted,
    activePlanting,
    familyUsage: [...familyMap.values()]
      .filter((f) => f.timesPlanted > 0)
      .sort((a, b) => (b.lastPlantedOn ?? "").localeCompare(a.lastPlantedOn ?? "")),
    soil: input.soil,
    soilInsights: soilInsightList,
    recommendations,
    headline,
    explanation,
    counts,
  };
}

function buildHeadline(
  reference: PlantingRecord | null,
  active: PlantingRecord | null,
): string {
  if (active) {
    return `Petak sedang ditanami ${active.cropCommonName}. Rencanakan rotasi setelah panen.`;
  }
  if (!reference) {
    return "Petak belum pernah ditanami — silakan pilih tanaman apa pun untuk memulai siklus rotasi.";
  }
  return `Musim terakhir: ${reference.cropCommonName} (famili ${reference.familyName}). Pilih tanaman dari famili berbeda.`;
}

function buildExplanation(reference: PlantingRecord | null, plotName: string): string {
  if (!reference) {
    return `TerraSiklus memberi skor untuk setiap tanaman berdasarkan famili botani, kebutuhan hara, dan hasil uji tanah di ${plotName}. Mulai dengan tanaman pembenah agar petak cepat subur.`;
  }
  return `TerraSiklus menilai ${plotName} dengan 4 aturan rotasi: (1) hindari famili ${reference.familyName} yang baru dipakai, (2) jeda minimal ${IDEAL_FAMILY_GAP_MONTHS} bulan per famili, (3) seimbangkan hara tanah, dan (4) sesuaikan pH hasil uji tanah.`;
}

/** Evaluasi satu pilihan tanaman spesifik (untuk peringatan saat memilih). */
export function evaluateChoice(
  analysis: RotationAnalysis,
  cropId: number,
): RotationRecommendation | null {
  return analysis.recommendations.find((r) => r.cropId === cropId) ?? null;
}

/** Prediksi tanggal panen dari tanggal tanam. */
export function expectedHarvest(plantedOn: string, daysToHarvest: number | null): string | null {
  if (!daysToHarvest) return null;
  return addDaysISO(plantedOn, daysToHarvest);
}

export function daysOverdue(plantedOn: string, daysToHarvest: number | null): number | null {
  const expected = expectedHarvest(plantedOn, daysToHarvest);
  if (!expected) return null;
  return daysBetween(expected, todayISO());
}
