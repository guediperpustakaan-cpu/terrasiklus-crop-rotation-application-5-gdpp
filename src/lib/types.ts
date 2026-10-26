export type NutrientDemand = "tinggi" | "sedang" | "rendah";
export type SoilImpact = "berat" | "netral" | "pembenah";
export type RecommendationStatus = "disarankan" | "hati-hati" | "hindari";
export type ReasonKind = "positif" | "peringatan" | "bahaya" | "info";

export interface FamilyInfo {
  id: number;
  name: string;
  localName: string | null;
  description: string | null;
  pestRisk: string | null;
}

export interface CropWithFamily {
  id: number;
  commonName: string;
  slug: string;
  nutrientDemand: NutrientDemand;
  soilImpact: SoilImpact;
  daysToHarvest: number | null;
  minPh: number | null;
  maxPh: number | null;
  emoji: string | null;
  description: string | null;
  familyId: number;
  familyName: string;
  familyLocalName: string | null;
  familyDescription: string | null;
  familyPestRisk: string | null;
}

export interface PlantingRecord {
  id: number;
  plotId: number;
  cropId: number;
  plantedOn: string;
  harvestedOn: string | null;
  status: string;
  yieldKg: number | null;
  notes: string | null;
  pestNotes: string | null;
  cropCommonName: string;
  cropEmoji: string | null;
  cropNutrientDemand: NutrientDemand;
  cropSoilImpact: SoilImpact;
  cropDaysToHarvest: number | null;
  familyId: number;
  familyName: string;
  familyLocalName: string | null;
}

export interface SoilTestRecord {
  id: number;
  plotId: number;
  testedOn: string;
  ph: number;
  n: number | null;
  p: number | null;
  k: number | null;
  organicMatter: number | null;
  notes: string | null;
}

export interface PlotSummary {
  id: number;
  farmId: number;
  farmName: string;
  name: string;
  area: number | null;
  areaUnit: string;
  soilType: string | null;
  notes: string | null;
  activePlanting: PlantingRecord | null;
  lastPlanting: PlantingRecord | null;
  latestSoilTest: SoilTestRecord | null;
  soilHealthScore: number | null;
  plantingCount: number;
  healthLabel: string;
  healthColor: string;
}

export interface RotationReason {
  kind: ReasonKind;
  label: string;
}

export interface RotationRecommendation {
  cropId: number;
  cropName: string;
  emoji: string | null;
  familyName: string;
  familyLocalName: string | null;
  nutrientDemand: NutrientDemand;
  soilImpact: SoilImpact;
  daysToHarvest: number | null;
  score: number;
  status: RecommendationStatus;
  reasons: RotationReason[];
}

export interface FamilyUsage {
  familyId: number;
  familyName: string;
  lastPlantedOn: string | null;
  timesPlanted: number;
  monthsSince: number | null;
  hadPestIssue: boolean;
}

export interface SoilInsight {
  label: string;
  tone: "baik" | "sedang" | "buruk";
  message: string;
}

export interface RotationAnalysis {
  plotId: number;
  plotName: string;
  evaluatedOn: string;
  lastCompleted: PlantingRecord | null;
  activePlanting: PlantingRecord | null;
  familyUsage: FamilyUsage[];
  soil: SoilTestRecord | null;
  soilInsights: SoilInsight[];
  recommendations: RotationRecommendation[];
  headline: string;
  explanation: string;
  counts: Record<RecommendationStatus, number>;
}

export interface NextAction {
  id: string;
  icon: "panen" | "tanam" | "tanah" | "hama" | "rencana";
  title: string;
  detail: string;
  href: string;
  urgency: "tinggi" | "sedang" | "rendah";
  dateLabel?: string;
}

export interface DashboardData {
  profileName: string;
  farmCount: number;
  plotCount: number;
  totalArea: number;
  activePlantings: Array<PlantingRecord & { plotName: string; farmName: string; expectedHarvest: string | null }>;
  actions: NextAction[];
  familyBalance: Array<{ familyName: string; count: number }>;
  stats: {
    harvestedThisYear: number;
    avgSoilHealth: number | null;
    plotsIdle: number;
  };
}
