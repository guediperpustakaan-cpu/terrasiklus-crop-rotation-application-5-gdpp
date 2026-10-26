"use client";

import { useQuery } from "@tanstack/react-query";
import { NotebookPen, Scissors, Sprout } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HarvestModal, PlantingForm } from "@/components/planting-form";
import {
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Select,
  Skeleton,
  StatTile,
  Toast,
} from "@/components/ui";
import { api, qk } from "@/lib/api";
import { daysBetween, formatDateID, formatNumberID, relativeDaysID } from "@/lib/format";
import { expectedHarvest } from "@/lib/rotation";

export default function RiwayatPage() {
  const [plotFilter, setPlotFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [familyFilter, setFamilyFilter] = useState("semua");
  const [plantingModal, setPlantingModal] = useState(false);
  const [harvestTarget, setHarvestTarget] = useState<{
    id: number;
    cropName: string;
    plantedOn: string;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const plantings = useQuery({ queryKey: qk.plantings, queryFn: () => api.plantings() });
  const plots = useQuery({ queryKey: qk.plots, queryFn: () => api.plots() });
  const cropsQuery = useQuery({ queryKey: qk.crops, queryFn: api.crops });

  const families = useMemo(() => {
    const set = new Set<string>();
    for (const item of plantings.data?.plantings ?? []) set.add(item.familyName);
    return [...set].sort();
  }, [plantings.data]);

  const filtered = useMemo(() => {
    const list = plantings.data?.plantings ?? [];
    return list.filter((item) => {
      if (plotFilter !== "semua" && String(item.plotId) !== plotFilter) return false;
      if (familyFilter !== "semua" && item.familyName !== familyFilter) return false;
      if (statusFilter === "berjalan" && item.harvestedOn !== null) return false;
      if (statusFilter === "panen" && item.harvestedOn === null) return false;
      if (statusFilter === "hama" && !item.pestNotes) return false;
      return true;
    });
  }, [plantings.data, plotFilter, familyFilter, statusFilter]);

  const stats = useMemo(() => {
    const list = plantings.data?.plantings ?? [];
    const harvested = list.filter((p) => p.harvestedOn !== null);
    const totalYield = harvested.reduce((sum, p) => sum + (p.yieldKg ?? 0), 0);
    const avgDuration =
      harvested.length > 0
        ? Math.round(
            harvested.reduce(
              (sum, p) => sum + daysBetween(p.plantedOn, p.harvestedOn as string),
              0,
            ) / harvested.length,
          )
        : null;
    const pestCount = list.filter((p) => p.pestNotes).length;
    return {
      total: list.length,
      active: list.filter((p) => p.harvestedOn === null).length,
      totalYield,
      avgDuration,
      pestCount,
    };
  }, [plantings.data]);

  const plotOptions = plots.data?.plots ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Log Musim Tanam"
        title="Riwayat Tanam"
        description="Seluruh catatan penanaman dari semua petak — dasar utama analisis rotasi TerraSiklus."
        action={
          <button
            className="btn-primary"
            onClick={() => setPlantingModal(true)}
            disabled={plotOptions.length === 0}
          >
            <Sprout className="h-4 w-4" /> Catat Penanaman
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<NotebookPen className="h-5 w-5" />}
          label="Total catatan"
          value={String(stats.total)}
          accent="bg-leaf-100 text-leaf-700"
        />
        <StatTile
          icon={<Sprout className="h-5 w-5" />}
          label="Sedang berjalan"
          value={String(stats.active)}
          accent="bg-amber-100 text-amber-700"
        />
        <StatTile
          icon={<Scissors className="h-5 w-5" />}
          label="Total hasil panen"
          value={`${formatNumberID(stats.totalYield, 1)} kg`}
          accent="bg-soil-100 text-soil-700"
        />
        <StatTile
          icon={<NotebookPen className="h-5 w-5" />}
          label="Rata-rata musim"
          value={stats.avgDuration !== null ? `${stats.avgDuration} hari` : "—"}
          suffix={`· ${stats.pestCount} catatan hama`}
          accent="bg-sky-100 text-sky-700"
        />
      </div>

      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={plotFilter} onChange={(event) => setPlotFilter(event.target.value)}>
            <option value="semua">Semua petak</option>
            {plotOptions.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.name}
              </option>
            ))}
          </Select>
          <Select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)}>
            <option value="semua">Semua famili</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="semua">Semua status</option>
            <option value="berjalan">Sedang berjalan</option>
            <option value="panen">Sudah panen</option>
            <option value="hama">Ada catatan hama</option>
          </Select>
        </div>
      </Card>

      {plantings.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-7 w-7" />}
          title="Belum ada riwayat tanam"
          description="Catat penanaman pertama Anda untuk mulai membangun riwayat rotasi."
          action={
            <Link href="/kebun" className="btn-primary">
              <Sprout className="h-4 w-4" /> Kelola petak
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isActive = item.harvestedOn === null;
            const expectedDate = expectedHarvest(item.plantedOn, item.cropDaysToHarvest);
            return (
              <Card key={item.id} hover className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soil-50 text-2xl">
                      {item.cropEmoji ?? "🌱"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-soil-900">{item.cropCommonName}</p>
                        <Chip tone={isActive ? "green" : "soil"}>
                          {isActive ? "Berjalan" : "Panen"}
                        </Chip>
                        <Chip tone="blue">{item.familyName}</Chip>
                      </div>
                      <p className="mt-1 truncate text-xs text-soil-500">
                        <Link href={`/petak/${item.plotId}`} className="font-semibold text-leaf-700 hover:underline">
                          {item.plotName}
                        </Link>{" "}
                        · {item.farmName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-soil-400">
                        Tanam {formatDateID(item.plantedOn)}
                        {item.harvestedOn
                          ? ` → panen ${formatDateID(item.harvestedOn)} (${daysBetween(item.plantedOn, item.harvestedOn)} hari)`
                          : expectedDate
                            ? ` → prediksi panen ${relativeDaysID(expectedDate)}`
                            : ""}
                        {item.yieldKg ? ` · ${formatNumberID(item.yieldKg, 1)} kg` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <button
                        className="btn-secondary px-3 py-2 text-xs"
                        onClick={() =>
                          setHarvestTarget({
                            id: item.id,
                            cropName: item.cropCommonName,
                            plantedOn: item.plantedOn,
                          })
                        }
                      >
                        <Scissors className="h-3.5 w-3.5" /> Catat panen
                      </button>
                    ) : null}
                    <Link href={`/petak/${item.plotId}`} className="btn-ghost px-3 py-2 text-xs">
                      Detail
                    </Link>
                  </div>
                </div>
                {item.pestNotes ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    <strong>Hama/penyakit:</strong> {item.pestNotes}
                  </p>
                ) : item.notes ? (
                  <p className="mt-3 rounded-xl bg-soil-50 px-3 py-2 text-[11px] text-soil-600">
                    <strong className="text-soil-700">Catatan:</strong> {item.notes}
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {plantingModal ? (
        <PlantingForm
          open={plantingModal}
          onClose={() => setPlantingModal(false)}
          plots={plotOptions.map((plot) => ({ id: plot.id, name: plot.name }))}
          crops={cropsQuery.data?.crops ?? []}
        />
      ) : null}

      {harvestTarget ? (
        <HarvestModal
          open={Boolean(harvestTarget)}
          onClose={() => setHarvestTarget(null)}
          plantingId={harvestTarget.id}
          cropName={harvestTarget.cropName}
          plantedOn={harvestTarget.plantedOn}
        />
      ) : null}

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}
