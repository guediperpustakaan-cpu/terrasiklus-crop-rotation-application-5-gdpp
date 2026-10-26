"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PlotCard } from "@/components/plot-card";
import { PlotFormModal } from "@/components/plot-form-modal";
import { Card, Chip, EmptyState, PageHeader, Skeleton, Toast } from "@/components/ui";
import { api, qk } from "@/lib/api";

export default function GardenDetailPage() {
  const params = useParams<{ id: string }>();
  const farmId = Number(params.id);
  const queryClient = useQueryClient();
  const [plotModal, setPlotModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const farms = useQuery({ queryKey: qk.farms, queryFn: api.farms });
  const plots = useQuery({
    queryKey: [...qk.plots, farmId],
    queryFn: () => api.plots(farmId),
  });

  const deletePlot = useMutation({
    mutationFn: (id: number) => api.deletePlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToast({ message: "Petak dihapus.", tone: "success" });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  const farm = farms.data?.farms.find((f) => f.id === farmId);
  const plotList = plots.data?.plots ?? [];

  if (farms.isLoading) return <Skeleton className="h-64 w-full" />;

  if (!farm) {
    return (
      <EmptyState
        icon={<span className="text-xl">🌾</span>}
        title="Kebun tidak ditemukan"
        description="Kebun mungkin sudah dihapus."
        action={
          <Link href="/kebun" className="btn-primary">
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar kebun
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link href="/kebun" className="btn-ghost mb-3 -ml-2 px-2">
        <ArrowLeft className="h-4 w-4" /> Semua kebun
      </Link>

      <PageHeader
        eyebrow={farm.location ?? "Kebun"}
        title={farm.name}
        description={farm.description ?? "Kelola petak-petak di kebun ini."}
        action={
          <button className="btn-primary" onClick={() => setPlotModal(true)}>
            <Plus className="h-4 w-4" /> Tambah Petak
          </button>
        }
      />

      <Card className="mb-6 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        {[
          { label: "Jumlah petak", value: `${farm.plotCount}` },
          { label: "Luas total", value: `${farm.totalArea} m²` },
          {
            label: "Petak aktif",
            value: `${plotList.filter((p) => p.activePlanting).length}`,
          },
          {
            label: "Petak kosong",
            value: `${plotList.filter((p) => !p.activePlanting).length}`,
          },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] font-semibold tracking-wide text-soil-400 uppercase">
              {stat.label}
            </p>
            <p className="text-xl font-extrabold text-soil-900">{stat.value}</p>
          </div>
        ))}
      </Card>

      {plots.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : plotList.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-7 w-7" />}
          title="Belum ada petak"
          description="Tambahkan petak pertama untuk mulai mencatat rotasi tanam."
          action={
            <button className="btn-primary" onClick={() => setPlotModal(true)}>
              <Plus className="h-4 w-4" /> Tambah Petak
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plotList.map((plot) => (
            <div key={plot.id} className="relative">
              <PlotCard plot={plot} />
              <button
                className="absolute top-3 right-3 rounded-lg bg-white/90 p-1.5 text-soil-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  if (confirm(`Hapus ${plot.name}? Riwayat tanam & uji tanah ikut terhapus.`)) {
                    deletePlot.mutate(plot.id);
                  }
                }}
                aria-label="Hapus petak"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip tone="green">Tips</Chip>
        <p className="text-sm text-soil-500">
          Pisahkan petak berdasarkan kelompok tanaman agar rotasi famili lebih mudah
          diterapkan.
        </p>
      </div>

      <PlotFormModal
        open={plotModal}
        onClose={() => setPlotModal(false)}
        farms={[{ id: farm.id, name: farm.name }]}
        defaultFarmId={farm.id}
      />

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}
