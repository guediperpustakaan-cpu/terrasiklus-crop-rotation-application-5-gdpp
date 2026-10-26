"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Leaf,
  ShieldAlert,
  Sparkles,
  Sprout,
} from "lucide-react";
import {
  Card,
  Chip,
  DEMAND_SHORT,
  demandTone,
  SOIL_IMPACT_LABEL,
} from "@/components/ui";
import { formatDateShortID } from "@/lib/format";
import { statusMeta } from "@/lib/rotation";
import type { RecommendationStatus, RotationAnalysis, RotationRecommendation } from "@/lib/types";

const REASON_ICON = {
  positif: { Icon: CheckCircle2, className: "text-leaf-600" },
  peringatan: { Icon: AlertTriangle, className: "text-amber-600" },
  bahaya: { Icon: ShieldAlert, className: "text-red-600" },
  info: { Icon: Info, className: "text-sky-600" },
} as const;

const TABS: Array<{ key: RecommendationStatus | "semua"; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "disarankan", label: "Disarankan" },
  { key: "hati-hati", label: "Perlu Pertimbangan" },
  { key: "hindari", label: "Hindari" },
];

function RecommendationRow({
  item,
  rank,
  onSelect,
}: {
  item: RotationRecommendation;
  rank: number;
  onSelect: (cropId: number) => void;
}) {
  const [open, setOpen] = useState(rank === 0);
  const meta = statusMeta(item.status);

  return (
    <div className="rounded-2xl border border-soil-100 bg-white transition hover:border-leaf-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-3.5 text-left sm:p-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soil-50 text-2xl">
          {item.emoji ?? "🌱"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-soil-900">{item.cropName}</p>
            <span
              className="chip"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-soil-500">
            {item.familyName}
            {item.familyLocalName ? ` · ${item.familyLocalName}` : ""}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 max-w-40 flex-1 overflow-hidden rounded-full bg-soil-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.score}%`,
                  background:
                    item.status === "disarankan"
                      ? "#319e5c"
                      : item.status === "hati-hati"
                        ? "#f59e0b"
                        : "#dc2626",
                }}
              />
            </div>
            <span className="text-xs font-extrabold text-soil-700">{item.score}</span>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <Chip tone={demandTone(item.nutrientDemand)}>{DEMAND_SHORT[item.nutrientDemand]}</Chip>
          <Chip tone={item.soilImpact === "pembenah" ? "green" : "soil"}>
            {SOIL_IMPACT_LABEL[item.soilImpact]}
          </Chip>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-soil-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="animate-fade-up border-t border-soil-100 px-3.5 pt-3 pb-3.5 sm:px-4">
          <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-soil-400 uppercase">
            Alasan rekomendasi
          </p>
          <ul className="space-y-2">
            {item.reasons.map((reason, index) => {
              const { Icon, className } = REASON_ICON[reason.kind];
              return (
                <li key={index} className="flex gap-2 text-xs leading-relaxed text-soil-600">
                  <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${className}`} />
                  <span>{reason.label}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.daysToHarvest ? (
              <Chip tone="soil">± {item.daysToHarvest} hari panen</Chip>
            ) : null}
            <button className="btn-primary ml-auto px-3 py-2 text-xs" onClick={() => onSelect(item.cropId)}>
              <Sprout className="h-3.5 w-3.5" /> Tanam ini
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RotationEngine({
  analysis,
  onSelectCrop,
  limit = 24,
}: {
  analysis: RotationAnalysis;
  onSelectCrop: (cropId: number) => void;
  limit?: number;
}) {
  const [tab, setTab] = useState<RecommendationStatus | "semua">("disarankan");

  const filtered = useMemo(() => {
    const list =
      tab === "semua"
        ? analysis.recommendations
        : analysis.recommendations.filter((r) => r.status === tab);
    return list.slice(0, limit);
  }, [analysis.recommendations, tab, limit]);

  const reference = analysis.activePlanting ?? analysis.lastCompleted;

  return (
    <Card className="p-5" >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="section-title">Rekomendasi Rotasi Tanam</h2>
            <p className="mt-0.5 max-w-2xl text-sm text-soil-500">{analysis.headline}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Chip tone="green">{analysis.counts.disarankan} disarankan</Chip>
          <Chip tone="amber">{analysis.counts["hati-hati"]} dipertimbangkan</Chip>
          <Chip tone="red">{analysis.counts.hindari} hindari</Chip>
        </div>
      </div>

      {reference ? (
        <div className="mt-4 rounded-2xl bg-leaf-50/70 p-4 ring-1 ring-leaf-100">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-leaf-600" />
              <span className="font-bold text-soil-800">Musim terakhir:</span>
              <span className="text-soil-600">
                {reference.cropEmoji} {reference.cropCommonName} · {reference.familyName}
              </span>
            </div>
            <div className="text-soil-500">
              Tanam {formatDateShortID(reference.plantedOn)}
              {reference.harvestedOn
                ? ` → panen ${formatDateShortID(reference.harvestedOn)}`
                : " (masih berjalan)"}
            </div>
          </div>
          {analysis.familyUsage.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-leaf-100 pt-3">
              <span className="text-[11px] font-bold text-soil-500">Riwayat famili petak ini:</span>
              {analysis.familyUsage.map((usage) => (
                <Chip
                  key={usage.familyId}
                  tone={
                    usage.monthsSince !== null && usage.monthsSince < 6
                      ? "red"
                      : usage.monthsSince !== null && usage.monthsSince < 12
                        ? "amber"
                        : "green"
                  }
                >
                  {usage.familyName} · {usage.monthsSince} bln lalu · {usage.timesPlanted}x
                </Chip>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 rounded-xl bg-soil-50 px-3.5 py-2.5 text-xs leading-relaxed text-soil-600">
        {analysis.explanation}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((item) => {
          const count =
            item.key === "semua"
              ? analysis.recommendations.length
              : analysis.recommendations.filter((r) => r.status === item.key).length;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                tab === item.key
                  ? "bg-leaf-600 text-white shadow-sm"
                  : "bg-soil-100 text-soil-600 hover:bg-soil-200"
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-soil-400">
            Tidak ada tanaman pada kategori ini.
          </p>
        ) : (
          filtered.map((item, index) => (
            <RecommendationRow
              key={item.cropId}
              item={item}
              rank={index}
              onSelect={onSelectCrop}
            />
          ))
        )}
      </div>
    </Card>
  );
}
