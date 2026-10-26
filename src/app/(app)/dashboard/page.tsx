"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bug,
  CalendarClock,
  FlaskConical,
  Layers,
  Leaf,
  LineChart,
  Plus,
  Ruler,
  Scissors,
  Sparkles,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Skeleton,
  Toast,
} from "@/components/ui";
import { api, qk } from "@/lib/api";
import { formatDateShortID, formatNumberID, relativeDaysID } from "@/lib/format";
import type { NextAction } from "@/lib/types";

const ACTION_META: Record<
  NextAction["icon"],
  { label: string; className: string; Icon: typeof Scissors }
> = {
  panen: { label: "Panen", className: "bg-amber-100 text-amber-700", Icon: Scissors },
  tanam: { label: "Tanam", className: "bg-leaf-100 text-leaf-700", Icon: Sprout },
  tanah: { label: "Tanah", className: "bg-sky-100 text-sky-700", Icon: FlaskConical },
  hama: { label: "Hama", className: "bg-red-100 text-red-700", Icon: Bug },
  rencana: { label: "Rencana", className: "bg-soil-100 text-soil-700", Icon: CalendarClock },
};

function StatTile({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-soil-500 uppercase">
            {label}
          </p>
          <p className="text-xl leading-tight font-extrabold text-soil-900">
            {value}
            {suffix ? <span className="ml-1 text-xs font-semibold text-soil-400">{suffix}</span> : null}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const dashboard = useQuery({ queryKey: qk.dashboard, queryFn: api.dashboard });
  const plots = useQuery({ queryKey: qk.plots, queryFn: () => api.plots() });

  const seedDemo = useMutation({
    mutationFn: api.seedDemo,
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      setToast({
        message: result.created
          ? "Data contoh berhasil dimuat. Jelajahi kebunnya!"
          : "Kebun sudah ada — data contoh tidak diperlukan.",
        tone: "success",
      });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  if (dashboard.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const data = dashboard.data;
  if (!data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Dasbor gagal dimuat"
        description={dashboard.error?.message ?? "Coba muat ulang halaman."}
        action={
          <button className="btn-primary" onClick={() => dashboard.refetch()}>
            Muat ulang
          </button>
        }
      />
    );
  }

  const isEmpty = data.plotCount === 0;
  const maxFamily = Math.max(1, ...data.familyBalance.map((f) => f.count));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Selamat datang kembali, ${data.profileName}`}
        title="Dasbor Kebun"
        description="Ringkasan kondisi kebun, tanaman aktif, dan aksi terpenting untuk hari ini."
        action={
          <div className="flex gap-2">
            <Link href="/kebun" className="btn-secondary">
              <Plus className="h-4 w-4" /> Kelola Petak
            </Link>
            <Link href="/riwayat" className="btn-primary">
              <Sprout className="h-4 w-4" /> Catat Tanam
            </Link>
          </div>
        }
      />

      {isEmpty ? (
        <Card className="p-6">
          <EmptyState
            icon={<Sprout className="h-7 w-7" />}
            title="Belum ada kebun terdaftar"
            description="Mulai dengan memuat data contoh (2 kebun, 5 petak, riwayat 3 musim tanam) atau buat kebun Anda sendiri."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className="btn-primary"
                  onClick={() => seedDemo.mutate()}
                  disabled={seedDemo.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  {seedDemo.isPending ? "Memuat..." : "Muat Data Contoh"}
                </button>
                <Link href="/kebun" className="btn-secondary">
                  Buat kebun sendiri
                </Link>
              </div>
            }
          />
        </Card>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Layers className="h-5 w-5" />}
          label="Kebun"
          value={String(data.farmCount)}
          accent="bg-leaf-100 text-leaf-700"
        />
        <StatTile
          icon={<Sprout className="h-5 w-5" />}
          label="Petak"
          value={String(data.plotCount)}
          suffix={`· ${data.stats.plotsIdle} kosong`}
          accent="bg-amber-100 text-amber-700"
        />
        <StatTile
          icon={<Ruler className="h-5 w-5" />}
          label="Luas total"
          value={formatNumberID(data.totalArea, 0)}
          suffix="m²"
          accent="bg-soil-100 text-soil-700"
        />
        <StatTile
          icon={<LineChart className="h-5 w-5" />}
          label="Skor tanah rata-rata"
          value={data.stats.avgSoilHealth !== null ? String(data.stats.avgSoilHealth) : "—"}
          suffix="/100"
          accent="bg-sky-100 text-sky-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Active plants */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <Leaf className="h-5 w-5 text-leaf-600" /> Tanaman Aktif
            </h2>
            <span className="text-xs font-semibold text-soil-400">
              {data.activePlantings.length} petak sedang ditanami
            </span>
          </div>
          <div className="space-y-3">
            {data.activePlantings.length === 0 ? (
              <Card className="p-5">
                <p className="text-sm text-soil-500">
                  Tidak ada tanaman aktif. Saatnya merencanakan rotasi musim berikutnya.
                </p>
              </Card>
            ) : (
              data.activePlantings.map((planting) => {
                const overdue =
                  planting.expectedHarvest !== null &&
                  new Date(planting.expectedHarvest) < new Date();
                return (
                  <Card key={planting.id} hover className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-2xl">
                          {planting.cropEmoji ?? "🌱"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-soil-900">
                            {planting.cropCommonName}
                          </p>
                          <p className="truncate text-xs text-soil-500">
                            {planting.plotName} · {planting.farmName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold tracking-wide text-soil-400 uppercase">
                          Prediksi panen
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            overdue ? "text-red-600" : "text-leaf-700"
                          }`}
                        >
                          {planting.expectedHarvest
                            ? relativeDaysID(planting.expectedHarvest)
                            : "—"}
                        </p>
                        <p className="text-[11px] text-soil-400">
                          {formatDateShortID(planting.expectedHarvest)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-soil-100 pt-3">
                      <Chip tone="soil">{planting.familyName}</Chip>
                      <Chip tone="green">Tanam {formatDateShortID(planting.plantedOn)}</Chip>
                      {planting.pestNotes ? (
                        <Chip tone="red">
                          <Bug className="h-3 w-3" /> Catatan hama
                        </Chip>
                      ) : null}
                      <Link
                        href={`/petak/${planting.plotId}`}
                        className="ml-auto text-xs font-bold text-leaf-700 hover:underline"
                      >
                        Kelola petak →
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Next actions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-leaf-600" /> Aksi Berikutnya
            </h2>
          </div>
          <div className="space-y-2.5">
            {data.actions.length === 0 ? (
              <Card className="p-5 text-sm text-soil-500">
                Semua terkendali! Tidak ada aksi mendesak saat ini.
              </Card>
            ) : (
              data.actions.map((action) => {
                const meta = ACTION_META[action.icon];
                const Icon = meta.Icon;
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="card card-hover flex items-start gap-3 p-3.5"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.className}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-soil-900">
                          {action.title}
                        </p>
                        {action.urgency === "tinggi" ? (
                          <Chip tone="red">Mendesak</Chip>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-soil-500">
                        {action.detail}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Family balance */}
      <Card className="p-5">
        <h2 className="section-title flex items-center gap-2">
          <Layers className="h-5 w-5 text-leaf-600" /> Keseimbangan Famili Botani
        </h2>
        <p className="mt-1 text-sm text-soil-500">
          Distribusi famili yang pernah ditanam di seluruh kebun. Semakin seimbang,
          semakin sehat siklus tanam Anda.
        </p>
        <div className="mt-4 space-y-2.5">
          {data.familyBalance.length === 0 ? (
            <p className="text-sm text-soil-400">Belum ada data riwayat tanam.</p>
          ) : (
            data.familyBalance.slice(0, 8).map((family) => (
              <div key={family.familyName} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs font-semibold text-soil-700">
                  {family.familyName}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-soil-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-leaf-400 to-leaf-600"
                    style={{ width: `${(family.count / maxFamily) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-bold text-soil-600">
                  {family.count}x
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {plots.data && plots.data.plots.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Status Petak Terkini</h2>
            <Link href="/kebun" className="text-xs font-bold text-leaf-700 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plots.data.plots.slice(0, 6).map((plot) => (
              <Link key={plot.id} href={`/petak/${plot.id}`} className="card card-hover p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-soil-900">{plot.name}</p>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: plot.healthColor }}
                  >
                    {plot.soilHealthScore !== null ? `${plot.soilHealthScore}/100` : "no data"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-soil-500">
                  {plot.activePlanting
                    ? `${plot.activePlanting.cropEmoji ?? "🌱"} ${plot.activePlanting.cropCommonName} · ${plot.healthLabel}`
                    : `Kosong · ${plot.lastPlanting ? `setelah ${plot.lastPlanting.cropCommonName}` : "belum ditanam"}`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}
