"use client";

import { Droplets, MapPin, Ruler, Sprout } from "lucide-react";
import Link from "next/link";
import { daysBetween, formatDateShortID, relativeDaysID, todayISO } from "@/lib/format";
import { expectedHarvest } from "@/lib/rotation";
import type { PlotSummary } from "@/lib/types";
import { Chip, DEMAND_SHORT, demandTone, ScoreRing } from "@/components/ui";

export function PlotCard({ plot }: { plot: PlotSummary }) {
  const active = plot.activePlanting;
  const expected = active
    ? expectedHarvest(active.plantedOn, active.cropDaysToHarvest)
    : null;
  const totalDays = active?.cropDaysToHarvest ?? null;
  const elapsed = active ? daysBetween(active.plantedOn, todayISO()) : 0;
  const progress =
    active && totalDays ? Math.min(100, Math.max(4, Math.round((elapsed / totalDays) * 100))) : 0;
  const overdue = expected ? daysBetween(expected, todayISO()) : 0;

  return (
    <Link
      href={`/petak/${plot.id}`}
      className="card card-hover flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.16em] text-soil-400 uppercase">
            {plot.farmName}
          </p>
          <h3 className="truncate text-base font-bold text-soil-900">{plot.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-soil-500">
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {plot.area ? `${plot.area} ${plot.areaUnit === "m2" ? "m²" : plot.areaUnit}` : "Luas belum diisi"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {plot.soilType ?? "Tanah belum diisi"}
            </span>
          </div>
        </div>
        <ScoreRing value={plot.soilHealthScore ?? 0} color={plot.healthColor} label="tanah" />
      </div>

      <div className="rounded-xl bg-soil-50 p-3">
        {active ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-soil-800">
                <span className="text-lg">{active.cropEmoji ?? "🌱"}</span>
                {active.cropCommonName}
              </span>
              <Chip tone={demandTone(active.cropNutrientDemand)}>
                {DEMAND_SHORT[active.cropNutrientDemand]}
              </Chip>
            </div>
            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-soil-500">
                <span>
                  Tanam {formatDateShortID(active.plantedOn)}
                </span>
                <span
                  className={
                    overdue > 0 ? "font-bold text-red-600" : "font-semibold text-leaf-700"
                  }
                >
                  {expected
                    ? overdue > 0
                      ? `Lewat ${overdue} hari dari prediksi panen`
                      : `Panen ${relativeDaysID(expected)}`
                    : "Prediksi panen belum tersedia"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-soil-200">
                <div
                  className="h-full rounded-full bg-leaf-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-soil-600">
            <Sprout className="h-4 w-4 text-leaf-600" />
            <span className="font-semibold">Petak kosong</span>
            {plot.lastPlanting ? (
              <span className="text-xs text-soil-400">
                · terakhir {plot.lastPlanting.cropCommonName} ({plot.lastPlanting.familyName})
              </span>
            ) : (
              <span className="text-xs text-soil-400">· belum ada riwayat tanam</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-soil-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {plot.lastPlanting ? (
            <Chip tone="soil">
              <MapPin className="h-3 w-3" /> {plot.lastPlanting.familyName}
            </Chip>
          ) : (
            <Chip tone="blue">Petak baru</Chip>
          )}
          <Chip tone="green">{plot.plantingCount} musim</Chip>
        </div>
        <span className="text-xs font-bold text-leaf-700">Buka detail →</span>
      </div>
    </Link>
  );
}
