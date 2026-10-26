import type { SoilInsight, SoilTestRecord } from "@/lib/types";

/** Rentang ideal (untuk hortikultura Indonesia). */
const IDEAL = {
  ph: { min: 6.0, max: 7.0 },
  n: { min: 15, max: 35 }, // ppm
  p: { min: 12, max: 30 }, // ppm
  k: { min: 10, max: 25 }, // ppm
  organicMatter: { min: 2.5, max: 5 }, // %
};

export const SOIL_IDEAL = IDEAL;

type Level = "rendah" | "sedang" | "tinggi";

function levelFor(value: number, low: number, high: number): Level {
  if (value < low) return "rendah";
  if (value > high) return "tinggi";
  return "sedang";
}

/** Skor 0–100 dari kedekatan ke rentang ideal tiap parameter. */
function scoreRange(value: number, min: number, max: number, weight: number): number {
  if (value >= min && value <= max) return weight;
  const center = (min + max) / 2;
  const half = (max - min) / 2;
  const distance = Math.abs(value - center);
  const ratio = Math.min(1, distance / (half * 2.2));
  return weight * (1 - ratio);
}

export function soilHealthScore(test: Pick<SoilTestRecord, "ph" | "n" | "p" | "k" | "organicMatter">): number {
  let score = 0;
  score += scoreRange(test.ph, IDEAL.ph.min, IDEAL.ph.max, 30);
  if (test.n !== null) score += scoreRange(test.n, IDEAL.n.min, IDEAL.n.max, 20);
  if (test.p !== null) score += scoreRange(test.p, IDEAL.p.min, IDEAL.p.max, 20);
  if (test.k !== null) score += scoreRange(test.k, IDEAL.k.min, IDEAL.k.max, 15);
  if (test.organicMatter !== null) score += scoreRange(test.organicMatter, IDEAL.organicMatter.min, IDEAL.organicMatter.max, 15);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function soilHealthLabel(score: number | null): string {
  if (score === null) return "Belum ada data";
  if (score >= 80) return "Sehat";
  if (score >= 60) return "Cukup Baik";
  if (score >= 40) return "Perlu Perhatian";
  return "Kritis";
}

export function soilHealthColor(score: number | null): string {
  if (score === null) return "#a3a3a3";
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#65a30d";
  if (score >= 40) return "#f59e0b";
  return "#dc2626";
}

export function phLabel(ph: number): string {
  if (ph < 5.5) return "Sangat Masam";
  if (ph < 6.0) return "Masam";
  if (ph <= 7.0) return "Ideal";
  if (ph <= 7.8) return "Agak Basa";
  return "Basa";
}

export function phRecommendation(ph: number): string {
  if (ph < 5.5)
    return "Tambahkan dolomit 150–200 g/m² untuk menaikkan pH dan mengurangi racun aluminium.";
  if (ph < 6.0)
    return "Tambahkan dolomit 100 g/m² dan kompos matang untuk mendekatkan pH ke 6,5.";
  if (ph <= 7.0) return "pH sudah ideal untuk mayoritas sayuran. Pertahankan dengan kompos rutin.";
  return "pH terlalu basa. Gunakan pupuk bersifat asam (sulfat) dan tambahkan bahan organik asam.";
}

export function nutrientLabel(kind: "n" | "p" | "k", value: number): string {
  if (kind === "n") return `Nitrogen ${levelFor(value, 15, 35)}`;
  if (kind === "p") return `Fosfor ${levelFor(value, 12, 30)}`;
  return `Kalium ${levelFor(value, 10, 25)}`;
}

export function nutrientAdvice(kind: "n" | "p" | "k", value: number): string {
  const level = levelFor(value, 15, 35);
  if (kind === "n") {
    if (level === "rendah") return "Nitrogen rendah: tanam kacang-kacangan (Fabaceae) atau beri pupuk kandang 2 kg/m².";
    if (level === "tinggi") return "Nitrogen tinggi: tanam sayuran daun berat seperti kubis atau jagung, hindari kelebihan pupuk Urea.";
    return "Nitrogen cukup. Jaga dengan kompos rutin setiap musim tanam.";
  }
  if (kind === "p") {
    if (level === "rendah") return "Fosfor rendah: beri pupuk TSP/SP-36 15–20 g/m² atau tepung tulang.";
    if (level === "tinggi") return "Fosfor berlebih: kurangi pupuk buatan, perbanyak bahan organik untuk mengunci fosfor.";
    return "Fosfor cukup untuk pembentukan akar dan bunga.";
  }
  if (level === "rendah") return "Kalium rendah: tambahkan abu kayu 100 g/m² atau KCl 10 g/m².";
  if (level === "tinggi") return "Kalium tinggi: cukup siram air, hindari pupuk KCl tambahan.";
  return "Kalium cukup untuk kualitas buah dan ketahanan penyakit.";
}

export function organicMatterAdvice(om: number): string {
  const level = levelFor(om, 2.5, 5);
  if (level === "rendah") return "Bahan organik rendah: aplikasikan kompos 3–5 kg/m² atau tanam pupuk hijau (Crotalaria).";
  if (level === "tinggi") return "Bahan organik sangat tinggi: pastikan drainase baik agar akar tidak busuk.";
  return "Bahan organik ideal; lanjutkan mulsa jerami setiap musim.";
}

/** Ringkasan wawasan tanah dalam Bahasa Indonesia. */
export function soilInsights(test: SoilTestRecord): SoilInsight[] {
  const insights: SoilInsight[] = [];

  insights.push({
    label: `pH ${test.ph} · ${phLabel(test.ph)}`,
    tone: test.ph >= 6 && test.ph <= 7 ? "baik" : test.ph >= 5.5 && test.ph <= 7.8 ? "sedang" : "buruk",
    message: phRecommendation(test.ph),
  });

  if (test.n !== null)
    insights.push({
      label: `N ${test.n} ppm`,
      tone: test.n >= 15 && test.n <= 35 ? "baik" : test.n < 10 || test.n > 45 ? "buruk" : "sedang",
      message: nutrientAdvice("n", test.n),
    });

  if (test.p !== null)
    insights.push({
      label: `P ${test.p} ppm`,
      tone: test.p >= 12 && test.p <= 30 ? "baik" : test.p < 8 || test.p > 40 ? "buruk" : "sedang",
      message: nutrientAdvice("p", test.p),
    });

  if (test.k !== null)
    insights.push({
      label: `K ${test.k} ppm`,
      tone: test.k >= 10 && test.k <= 25 ? "baik" : test.k < 7 || test.k > 35 ? "buruk" : "sedang",
      message: nutrientAdvice("k", test.k),
    });

  if (test.organicMatter !== null)
    insights.push({
      label: `BO ${test.organicMatter}%`,
      tone: test.organicMatter >= 2.5 && test.organicMatter <= 5 ? "baik" : test.organicMatter < 1.5 ? "buruk" : "sedang",
      message: organicMatterAdvice(test.organicMatter),
    });

  return insights;
}
