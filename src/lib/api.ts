import type {
  CropWithFamily,
  DashboardData,
  PlotSummary,
  RotationAnalysis,
  SoilTestRecord,
  PlantingRecord,
  FamilyUsage,
} from "@/lib/types";
import type { Farm } from "@/db/schema";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data?.error ?? "Terjadi kesalahan pada server.");
  return data;
}

/* ------------------------------- Query keys ------------------------------- */
export const qk = {
  dashboard: ["dashboard"] as const,
  crops: ["crops"] as const,
  farms: ["farms"] as const,
  plots: ["plots"] as const,
  plot: (id: number) => ["plot", id] as const,
  rotation: (id: number) => ["rotation", id] as const,
  plantings: ["plantings"] as const,
  soil: (id: number) => ["soil", id] as const,
};

/* --------------------------------- Types --------------------------------- */
export type FarmWithStats = Farm & { plotCount: number; totalArea: number };

export type PlantingWithPlot = PlantingRecord & {
  plotName: string;
  farmName: string;
};

export type PlotDetailPayload = {
  plot: { id: number; farmId: number; name: string; area: string | null; areaUnit: string; soilType: string | null; notes: string | null };
  farmName: string;
  history: PlantingRecord[];
  soil: SoilTestRecord[];
  rotation: RotationAnalysis;
};

/* --------------------------------- Fetchers ------------------------------- */
export const api = {
  dashboard: () => request<DashboardData>("/api/dashboard"),
  crops: () => request<{ crops: CropWithFamily[] }>("/api/crops"),
  farms: () => request<{ farms: FarmWithStats[] }>("/api/farms"),
  plots: (farmId?: number) =>
    request<{ plots: PlotSummary[] }>(
      farmId ? `/api/plots?farmId=${farmId}` : "/api/plots",
    ),
  plotDetail: (id: number) => request<PlotDetailPayload>(`/api/plots/${id}`),
  rotation: (id: number) =>
    request<{ analysis: RotationAnalysis }>(`/api/recommendations?plotId=${id}`),
  plantings: (plotId?: number) =>
    request<{ plantings: PlantingWithPlot[] }>(
      plotId ? `/api/plantings?plotId=${plotId}` : "/api/plantings",
    ),
  soil: (plotId: number) =>
    request<{ soilTests: SoilTestRecord[] }>(`/api/soil-tests?plotId=${plotId}`),

  createFarm: (body: { name: string; location?: string; description?: string }) =>
    request<{ farm: Farm }>("/api/farms", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteFarm: (id: number) =>
    request<{ ok: boolean }>(`/api/farms/${id}`, { method: "DELETE" }),

  createPlot: (body: {
    farmId: number;
    name: string;
    area?: string;
    areaUnit?: string;
    soilType?: string;
    notes?: string;
  }) =>
    request<{ plot: unknown }>("/api/plots", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePlot: (
    id: number,
    body: { name?: string; area?: string; soilType?: string; notes?: string },
  ) =>
    request<{ plot: unknown }>(`/api/plots/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deletePlot: (id: number) =>
    request<{ ok: boolean }>(`/api/plots/${id}`, { method: "DELETE" }),

  createPlanting: (body: {
    plotId: number;
    cropId: number;
    plantedOn?: string;
    harvestedOn?: string | null;
    notes?: string;
    pestNotes?: string;
    force?: boolean;
  }) =>
    request<{
      planting: PlantingRecord;
      rotation: { score: number; status: string; reasons: { kind: string; label: string }[]; cropName: string } | null;
    }>("/api/plantings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  harvestPlanting: (id: number, body: { harvestedOn: string; yieldKg?: string; pestNotes?: string }) =>
    request<{ planting: PlantingRecord }>(`/api/plantings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deletePlanting: (id: number) =>
    request<{ ok: boolean }>(`/api/plantings/${id}`, { method: "DELETE" }),

  createSoilTest: (body: {
    plotId: number;
    testedOn?: string;
    ph: string;
    n?: string;
    p?: string;
    k?: string;
    organicMatter?: string;
    notes?: string;
  }) =>
    request<{ soilTest: SoilTestRecord; score: number }>("/api/soil-tests", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteSoilTest: (id: number) =>
    request<{ ok: boolean }>(`/api/soil-tests?id=${id}`, { method: "DELETE" }),

  seedDemo: () => request<{ created: boolean }>("/api/demo", { method: "POST" }),
};

export type { FamilyUsage };
