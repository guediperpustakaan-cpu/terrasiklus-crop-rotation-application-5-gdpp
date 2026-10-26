"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  History,
  Layers,
  Pencil,
  Scissors,
  Sparkles,
  Sprout,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { HarvestModal, PlantingForm } from "@/components/planting-form";
import { RotationEngine } from "@/components/rotation-engine";
import { SoilForm } from "@/components/soil-form";
import {
  Alert,
  Card,
  Chip,
  DEMAND_SHORT,
  demandTone,
  EmptyState,
  MeterBar,
  PageHeader,
  ScoreRing,
  SectionHeader,
  Skeleton,
  Toast,
} from "@/components/ui";
import { api, qk } from "@/lib/api";
import {
  daysBetween,
  formatDateID,
  formatDateShortID,
  formatNumberID,
  relativeDaysID,
  todayISO,
} from "@/lib/format";
import { expectedHarvest } from "@/lib/rotation";
import {
  phLabel,
  soilHealthColor,
  soilHealthLabel,
  soilHealthScore,
  SOIL_IDEAL,
} from "@/lib/soil";

export default function PlotDetailPage() {
  const params = useParams<{ id: string }>();
  const plotId = Number(params.id);
  const queryClient = useQueryClient();

  const [plantingModal, setPlantingModal] = useState(false);
  const [presetCropId, setPresetCropId] = useState<number | undefined>();
  const [soilModal, setSoilModal] = useState(false);
  const [harvestTarget, setHarvestTarget] = useState<{
    id: number;
    cropName: string;
    plantedOn: string;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const detail = useQuery({
    queryKey: qk.plot(plotId),
    queryFn: () => api.plotDetail(plotId),
  });
  const crops = useQuery({ queryKey: qk.crops, queryFn: api.crops });

  const deletePlanting = useMutation({
    mutationFn: (id: number) => api.deletePlanting(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToast({ message: "Riwayat tanam dihapus.", tone: "success" });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  const deleteSoilTest = useMutation({
    mutationFn: (id: number) => api.deleteSoilTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToast({ message: "Data uji tanah dihapus.", tone: "success" });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  if (detail.isLoading || crops.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const payload = detail.data;
  if (!payload) {
    return (
      <EmptyState
        icon={<span className="text-xl">🌾</span>}
        title="Petak tidak ditemukan"
        description={detail.error?.message ?? "Petak mungkin sudah dihapus."}
        action={
          <Link href="/kebun" className="btn-primary">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        }
      />
    );
  }

  const { plot, farmName, history, soil, rotation } = payload;
  const active = history.find((p) => p.harvestedOn === null && p.status === "berjalan") ?? null;
  const latestSoil = soil[0] ?? null;
  const expected = active ? expectedHarvest(active.plantedOn, active.cropDaysToHarvest) : null;
  const elapsed = active ? daysBetween(active.plantedOn, todayISO()) : 0;
  const progress =
    active && active.cropDaysToHarvest
      ? Math.min(100, Math.max(4, Math.round((elapsed / active.cropDaysToHarvest) * 100)))
      : 0;
  const overdue = expected ? daysBetween(expected, todayISO()) : 0;

  const openPlantingModal = (cropId?: number) => {
    setPresetCropId(cropId);
    setPlantingModal(true);
  };

  return (
    <div className="space-y-7">
      <Link href={plot ? `/kebun/${plot.farmId}` : "/kebun"} className="btn-ghost -ml-2 px-2">
        <ArrowLeft className="h-4 w-4" /> {farmName}
      </Link>

      <PageHeader
        eyebrow={`Petak · ${farmName}`}
        title={plot.name}
        description={plot.notes ?? "Pantau riwayat tanam, rekomendasi rotasi, dan kesehatan tanah."}
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setSoilModal(true)}>
              <FlaskConical className="h-4 w-4" /> Uji Tanah
            </button>
            <button className="btn-primary" onClick={() => openPlantingModal()}>
              <Sprout className="h-4 w-4" /> Catat Penanaman
            </button>
          </div>
        }
      />

      {/* Info strip */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Luas petak", value: plot.area ? `${plot.area} ${plot.areaUnit === "m2" ? "m²" : plot.areaUnit}` : "—" },
          { label: "Jenis tanah", value: plot.soilType ?? "—" },
          { label: "Jumlah musim", value: `${history.length} musim` },
          {
            label: "Skor kesehatan tanah",
            value: latestSoil ? `${soilHealthScore(latestSoil)}/100` : "Belum ada data",
          },
        ].map((item, index) => (
          <Card key={index} className="p-4">
            <p className="text-[11px] font-semibold tracking-wide text-soil-400 uppercase">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-bold text-soil-900">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* Active planting */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-soil-100 bg-leaf-50/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
              {active?.cropEmoji ?? "🕳️"}
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-leaf-700 uppercase">
                {active ? "Tanaman aktif" : "Petak kosong"}
              </p>
              <h2 className="text-lg font-extrabold text-soil-900">
                {active ? active.cropCommonName : "Belum ada tanaman"}
              </h2>
            </div>
          </div>
          {active ? (
            <button className="btn-primary" onClick={() => setHarvestTarget({
              id: active.id,
              cropName: active.cropCommonName,
              plantedOn: active.plantedOn,
            })}>
              <Scissors className="h-4 w-4" /> Catat Panen
            </button>
          ) : (
            <button className="btn-primary" onClick={() => openPlantingModal()}>
              <Sprout className="h-4 w-4" /> Mulai Tanam
            </button>
          )}
        </div>

        {active ? (
          <div className="grid gap-5 p-5 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip tone="soil">Famili {active.familyName}</Chip>
                <Chip tone={demandTone(active.cropNutrientDemand)}>
                  {DEMAND_SHORT[active.cropNutrientDemand]}
                </Chip>
                {active.cropDaysToHarvest ? (
                  <Chip tone="green">± {active.cropDaysToHarvest} hari</Chip>
                ) : null}
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-soil-600">
                    Tanam {formatDateID(active.plantedOn)}
                  </span>
                  <span className={overdue > 0 ? "font-bold text-red-600" : "font-bold text-leaf-700"}>
                    {expected
                      ? overdue > 0
                        ? `Lewat ${overdue} hari dari prediksi`
                        : `Perkiraan panen ${relativeDaysID(expected)}`
                      : "Prediksi panen belum tersedia"}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-soil-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-leaf-600 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-soil-400">
                  {elapsed} hari sejak tanam
                  {active.cropDaysToHarvest ? ` dari estimasi ${active.cropDaysToHarvest} hari` : ""}
                </p>
              </div>
              {active.notes ? (
                <p className="mt-4 rounded-xl bg-soil-50 px-3.5 py-2.5 text-xs text-soil-600">
                  <strong className="text-soil-700">Catatan:</strong> {active.notes}
                </p>
              ) : null}
            </div>

            {active.pestNotes ? (
              <Alert tone="warning" title="Catatan hama / penyakit">
                {active.pestNotes}
              </Alert>
            ) : (
              <Alert tone="success" title="Kondisi sehat">
                Belum ada catatan hama atau penyakit pada musim ini. Teruskan rotasi famili
                agar kondisi ini terjaga.
              </Alert>
            )}
          </div>
        ) : (
          <div className="p-5">
            <p className="text-sm text-soil-600">
              Petak ini siap ditanam. Gunakan rekomendasi rotasi di bawah untuk memilih
              tanaman dari famili yang berbeda dari musim sebelumnya.
            </p>
            {rotation?.lastCompleted ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip tone="amber">Terakhir: {rotation.lastCompleted.cropCommonName}</Chip>
                <Chip tone="soil">{rotation.lastCompleted.familyName}</Chip>
                <span className="text-xs text-soil-400">
                  panen {formatDateShortID(rotation.lastCompleted.harvestedOn)}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      {/* Rotation engine */}
      <div id="rotasi" className="scroll-mt-24">
        <RotationEngine analysis={rotation} onSelectCrop={(cropId) => openPlantingModal(cropId)} />
      </div>

      {/* Soil health */}
      <section id="tanah" className="scroll-mt-24">
        <SectionHeader
          id="tanah-panel"
          icon={<FlaskConical className="h-5 w-5" />}
          title="Kesehatan Tanah"
          subtitle="Hasil uji tanah terbaru beserta saran perbaikan. Uji tanah idealnya dilakukan setiap 6 bulan."
          action={
            <button className="btn-secondary" onClick={() => setSoilModal(true)}>
              <FlaskConical className="h-4 w-4" /> Tambah Uji Tanah
            </button>
          }
        />

        {!latestSoil ? (
          <Card className="p-5">
            <EmptyState
              icon={<FlaskConical className="h-6 w-6" />}
              title="Belum ada data uji tanah"
              description="Catat hasil uji tanah agar rekomendasi rotasi mempertimbangkan pH dan hara tanah."
              action={
                <button className="btn-primary" onClick={() => setSoilModal(true)}>
                  <FlaskConical className="h-4 w-4" /> Catat Uji Tanah
                </button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] text-soil-400 uppercase">
                    Uji terakhir
                  </p>
                  <p className="text-sm font-bold text-soil-900">{formatDateID(latestSoil.testedOn)}</p>
                  <Chip
                    tone={
                      latestSoil.ph >= 6 && latestSoil.ph <= 7
                        ? "green"
                        : latestSoil.ph >= 5.5 && latestSoil.ph <= 7.8
                          ? "amber"
                          : "red"
                    }
                    className="mt-2"
                  >
                    pH {latestSoil.ph} · {phLabel(latestSoil.ph)}
                  </Chip>
                </div>
                <ScoreRing
                  value={soilHealthScore(latestSoil)}
                  color={soilHealthColor(soilHealthScore(latestSoil))}
                  label="tanah"
                />
              </div>

              <div className="mt-5 space-y-3.5">
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>pH</span>
                    <span>{latestSoil.ph}</span>
                  </div>
                  <MeterBar value={latestSoil.ph} min={4} max={9} ideal={[SOIL_IDEAL.ph.min, SOIL_IDEAL.ph.max]} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>Nitrogen (N)</span>
                    <span>{latestSoil.n !== null ? `${latestSoil.n} ppm` : "—"}</span>
                  </div>
                  <MeterBar value={latestSoil.n ?? 0} min={0} max={60} ideal={[SOIL_IDEAL.n.min, SOIL_IDEAL.n.max]} color="#3b82f6" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>Fosfor (P)</span>
                    <span>{latestSoil.p !== null ? `${latestSoil.p} ppm` : "—"}</span>
                  </div>
                  <MeterBar value={latestSoil.p ?? 0} min={0} max={60} ideal={[SOIL_IDEAL.p.min, SOIL_IDEAL.p.max]} color="#a855f7" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>Kalium (K)</span>
                    <span>{latestSoil.k !== null ? `${latestSoil.k} ppm` : "—"}</span>
                  </div>
                  <MeterBar value={latestSoil.k ?? 0} min={0} max={60} ideal={[SOIL_IDEAL.k.min, SOIL_IDEAL.k.max]} color="#f97316" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>Bahan organik</span>
                    <span>{latestSoil.organicMatter !== null ? `${latestSoil.organicMatter}%` : "—"}</span>
                  </div>
                  <MeterBar
                    value={latestSoil.organicMatter ?? 0}
                    min={0}
                    max={10}
                    ideal={[SOIL_IDEAL.organicMatter.min, SOIL_IDEAL.organicMatter.max]}
                    color="#92400e"
                  />
                </div>
              </div>

              {latestSoil.notes ? (
                <p className="mt-4 rounded-xl bg-soil-50 px-3.5 py-2.5 text-xs text-soil-600">
                  {latestSoil.notes}
                </p>
              ) : null}
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-soil-900">
                  <Sparkles className="h-4 w-4 text-leaf-600" /> Saran perbaikan tanah
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {rotation.soilInsights.map((insight, index) => (
                    <li key={index} className="rounded-xl border border-soil-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-soil-800">{insight.label}</p>
                        <Chip
                          tone={insight.tone === "baik" ? "green" : insight.tone === "sedang" ? "amber" : "red"}
                        >
                          {insight.tone === "baik" ? "Baik" : insight.tone === "sedang" ? "Sedang" : "Perlu tindakan"}
                        </Chip>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-soil-500">{insight.message}</p>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-soil-900">
                  <History className="h-4 w-4 text-leaf-600" /> Riwayat uji tanah
                </h3>
                <div className="mt-3 space-y-2">
                  {soil.map((test) => {
                    const drift =
                      latestSoil && test.id !== latestSoil.id
                        ? (latestSoil.ph - test.ph).toFixed(1)
                        : null;
                    return (
                      <div
                        key={test.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-soil-50 px-3 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-bold text-soil-800">
                            {formatDateShortID(test.testedOn)}
                          </p>
                          <p className="text-[11px] text-soil-500">
                            pH {test.ph}
                            {test.n !== null ? ` · N ${test.n}` : ""}
                            {test.p !== null ? ` · P ${test.p}` : ""}
                            {test.k !== null ? ` · K ${test.k}` : ""}
                            {test.organicMatter !== null ? ` · BO ${test.organicMatter}%` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {drift ? (
                            <Chip tone={Number(drift) > 0 ? "blue" : "amber"}>
                              pH {Number(drift) > 0 ? "naik" : "turun"} {Math.abs(Number(drift))}
                            </Chip>
                          ) : (
                            <Chip tone="green">Terbaru</Chip>
                          )}
                          <button
                            className="rounded-lg p-1.5 text-soil-400 transition hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm("Hapus data uji tanah ini?")) deleteSoilTest.mutate(test.id);
                            }}
                            aria-label="Hapus uji tanah"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* Planting history */}
      <section id="riwayat" className="scroll-mt-24">
        <SectionHeader
          icon={<ClipboardList className="h-5 w-5" />}
          title="Riwayat Tanam Petak"
          subtitle="Urutan musim tanam yang menjadi dasar analisis rotasi TerraSiklus."
        />
        {history.length === 0 ? (
          <Card className="p-5 text-sm text-soil-500">
            Belum ada riwayat tanam di petak ini.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {history.map((planting, index) => {
              const isActive = planting.harvestedOn === null;
              const isLatestCompleted = !isActive && index === history.findIndex((h) => h.harvestedOn !== null);
              const sameAsPrevious = index + 1 < history.length;
              const previous = sameAsPrevious ? history[index + 1] : null;
              const familyBreak =
                previous && previous.familyId !== planting.familyId ? "berbeda" : "sama";
              return (
                <Card key={planting.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soil-50 text-xl">
                        {planting.cropEmoji ?? "🌱"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-soil-900">{planting.cropCommonName}</p>
                          {isActive ? <Chip tone="green">Berjalan</Chip> : null}
                          {isLatestCompleted ? <Chip tone="blue">Musim terakhir</Chip> : null}
                          {previous ? (
                            <Chip tone={familyBreak === "berbeda" ? "green" : "red"}>
                              <Layers className="h-3 w-3" />
                              {familyBreak === "berbeda"
                                ? `Rotasi baik: ${previous.familyName} → ${planting.familyName}`
                                : `Risiko: famili sama (${planting.familyName})`}
                            </Chip>
                          ) : null}
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-soil-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDateID(planting.plantedOn)}
                            {planting.harvestedOn ? ` → ${formatDateID(planting.harvestedOn)}` : " → berjalan"}
                          </span>
                          {planting.harvestedOn ? (
                            <span>
                              ({daysBetween(planting.plantedOn, planting.harvestedOn)} hari)
                            </span>
                          ) : null}
                          {planting.yieldKg ? (
                            <span>· panen {formatNumberID(planting.yieldKg, 1)} kg</span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isActive ? (
                        <button
                          className="btn-secondary px-3 py-2 text-xs"
                          onClick={() =>
                            setHarvestTarget({
                              id: planting.id,
                              cropName: planting.cropCommonName,
                              plantedOn: planting.plantedOn,
                            })
                          }
                        >
                          <Scissors className="h-3.5 w-3.5" /> Panen
                        </button>
                      ) : (
                        <button
                          className="btn-ghost px-2.5 py-2 text-xs"
                          onClick={() =>
                            setHarvestTarget({
                              id: planting.id,
                              cropName: planting.cropCommonName,
                              plantedOn: planting.plantedOn,
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit hasil
                        </button>
                      )}
                      <button
                        className="rounded-lg p-2 text-soil-400 transition hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm(`Hapus riwayat tanam ${planting.cropCommonName}?`)) {
                            deletePlanting.mutate(planting.id);
                          }
                        }}
                        aria-label="Hapus riwayat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {planting.notes || planting.pestNotes ? (
                    <div className="mt-3 grid gap-2 border-t border-soil-100 pt-3 sm:grid-cols-2">
                      {planting.notes ? (
                        <p className="rounded-xl bg-soil-50 px-3 py-2 text-[11px] text-soil-600">
                          <strong className="text-soil-700">Catatan:</strong> {planting.notes}
                        </p>
                      ) : null}
                      {planting.pestNotes ? (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-700">
                          <strong>Hama/penyakit:</strong> {planting.pestNotes}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {plantingModal ? (
        <PlantingForm
          open={plantingModal}
          onClose={() => setPlantingModal(false)}
          plotId={plotId}
          plotName={plot.name}
          crops={crops.data?.crops ?? []}
          analysis={rotation}
          defaultCropId={presetCropId}
        />
      ) : null}

      <SoilForm
        open={soilModal}
        onClose={() => setSoilModal(false)}
        plotId={plotId}
        plotName={plot.name}
      />

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
