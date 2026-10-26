"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPinned, Plus, Sprout, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PlotCard } from "@/components/plot-card";
import { PlotFormModal } from "@/components/plot-form-modal";
import { Card, Chip, EmptyState, Field, Input, Modal, PageHeader, Skeleton, Textarea, Toast } from "@/components/ui";
import { api, qk } from "@/lib/api";

export default function KebunPage() {
  const queryClient = useQueryClient();
  const [gardenModal, setGardenModal] = useState(false);
  const [plotModal, setPlotModal] = useState(false);
  const [gardenForm, setGardenForm] = useState({ name: "", location: "", description: "" });
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const farms = useQuery({ queryKey: qk.farms, queryFn: api.farms });
  const plots = useQuery({ queryKey: qk.plots, queryFn: () => api.plots() });

  const createFarm = useMutation({
    mutationFn: () => api.createFarm(gardenForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.farms });
      queryClient.invalidateQueries({ queryKey: qk.dashboard });
      setToast({ message: `Kebun "${gardenForm.name}" berhasil dibuat.`, tone: "success" });
      setGardenForm({ name: "", location: "", description: "" });
      setGardenModal(false);
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  const deleteFarm = useMutation({
    mutationFn: (id: number) => api.deleteFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToast({ message: "Kebun dihapus.", tone: "success" });
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  const farmList = farms.data?.farms ?? [];
  const plotList = plots.data?.plots ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Manajemen Lahan"
        title="Kebun & Petak"
        description="Kelola daftar kebun Anda dan bagi menjadi petak-petak rotasi tanam."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setPlotModal(true)} disabled={farmList.length === 0}>
              <Plus className="h-4 w-4" /> Tambah Petak
            </button>
            <button className="btn-primary" onClick={() => setGardenModal(true)}>
              <Plus className="h-4 w-4" /> Tambah Kebun
            </button>
          </div>
        }
      />

      {farms.isLoading || plots.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : farmList.length === 0 ? (
        <EmptyState
          icon={<MapPinned className="h-7 w-7" />}
          title="Belum ada kebun"
          description="Daftarkan kebun pertama Anda untuk mulai mencatat petak dan riwayat tanam."
          action={
            <button className="btn-primary" onClick={() => setGardenModal(true)}>
              <Plus className="h-4 w-4" /> Buat Kebun
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {farmList.map((farm) => {
            const farmPlots = plotList.filter((p) => p.farmId === farm.id);
            return (
              <section key={farm.id}>
                <Card className="mb-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-soil-900">{farm.name}</h2>
                        <Chip tone="green">{farm.plotCount} petak</Chip>
                      </div>
                      <p className="mt-1 text-sm text-soil-500">
                        {farm.location ?? "Lokasi belum diisi"} ·{" "}
                        {farm.totalArea > 0 ? `${farm.totalArea} m²` : "luas belum diisi"}
                      </p>
                      {farm.description ? (
                        <p className="mt-1.5 max-w-2xl text-xs text-soil-400">{farm.description}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/kebun/${farm.id}`} className="btn-secondary">
                        <Sprout className="h-4 w-4" /> Detail Kebun
                      </Link>
                      <button
                        className="btn-danger px-3"
                        onClick={() => {
                          if (confirm(`Hapus kebun "${farm.name}" beserta semua petak dan riwayatnya?`)) {
                            deleteFarm.mutate(farm.id);
                          }
                        }}
                        aria-label="Hapus kebun"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>

                {farmPlots.length === 0 ? (
                  <Card className="p-5 text-sm text-soil-500">
                    Belum ada petak di kebun ini.
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {farmPlots.map((plot) => (
                      <PlotCard key={plot.id} plot={plot} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={gardenModal}
        onClose={() => setGardenModal(false)}
        title="Tambah Kebun"
        description="Kebun bisa berupa lahan rumah, pekarangan, atau sawah komunal."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createFarm.mutate();
          }}
        >
          <Field label="Nama kebun">
            <Input
              value={gardenForm.name}
              onChange={(e) => setGardenForm({ ...gardenForm, name: e.target.value })}
              placeholder="Kebun Bu Sari"
              required
            />
          </Field>
          <Field label="Lokasi">
            <Input
              value={gardenForm.location}
              onChange={(e) => setGardenForm({ ...gardenForm, location: e.target.value })}
              placeholder="Batu, Jawa Timur"
            />
          </Field>
          <Field label="Deskripsi">
            <Textarea
              rows={3}
              value={gardenForm.description}
              onChange={(e) => setGardenForm({ ...gardenForm, description: e.target.value })}
              placeholder="Kebun sayur keluarga seluas 600 m²..."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setGardenModal(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={createFarm.isPending}>
              {createFarm.isPending ? "Menyimpan..." : "Simpan Kebun"}
            </button>
          </div>
        </form>
      </Modal>

      <PlotFormModal
        open={plotModal}
        onClose={() => setPlotModal(false)}
        farms={farmList.map((f) => ({ id: f.id, name: f.name }))}
      />

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}
