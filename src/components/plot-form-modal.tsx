"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Field, Input, Modal, Select, Textarea, Toast } from "@/components/ui";
import { api, qk } from "@/lib/api";

const SOIL_TYPES = [
  "Liat (clay)",
  "Liat berpasir",
  "Lempung (loam)",
  "Lempung berpasir",
  "Pasir berhumus",
  "Alluvial",
  "Regosol",
  "Andosol",
  "Gambut",
];

export function PlotFormModal({
  open,
  onClose,
  farms,
  defaultFarmId,
}: {
  open: boolean;
  onClose: () => void;
  farms: Array<{ id: number; name: string }>;
  defaultFarmId?: number;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    farmId: defaultFarmId ? String(defaultFarmId) : farms[0] ? String(farms[0].id) : "",
    name: "",
    area: "",
    areaUnit: "m2",
    soilType: SOIL_TYPES[2],
    notes: "",
  });
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null,
  );

  const effectiveFarmId = form.farmId || (farms[0] ? String(farms[0].id) : "");

  const createPlot = useMutation({
    mutationFn: () =>
      api.createPlot({
        farmId: Number(effectiveFarmId),
        name: form.name,
        area: form.area,
        areaUnit: form.areaUnit,
        soilType: form.soilType,
        notes: form.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.plots });
      queryClient.invalidateQueries({ queryKey: qk.farms });
      queryClient.invalidateQueries({ queryKey: qk.dashboard });
      setToast({ message: `Petak "${form.name}" berhasil ditambahkan.`, tone: "success" });
      setForm((prev) => ({ ...prev, name: "", area: "", notes: "" }));
      onClose();
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Tambah Petak Baru"
        description="Petak adalah unit rotasi tanam. Pisahkan petak agar riwayat tanamnya terlacak."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createPlot.mutate();
          }}
        >
          <Field label="Kebun">
            <Select
              value={effectiveFarmId}
              onChange={(e) => setForm({ ...form, farmId: e.target.value })}
              required
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Nama petak" hint="Contoh: Petak A – Belakang Rumah">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Petak A"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Luas">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="120"
              />
            </Field>
            <Field label="Satuan">
              <Select
                value={form.areaUnit}
                onChange={(e) => setForm({ ...form, areaUnit: e.target.value })}
              >
                <option value="m2">m²</option>
                <option value="are">are</option>
                <option value="hektare">hektare</option>
              </Select>
            </Field>
          </div>

          <Field label="Jenis tanah">
            <Select
              value={form.soilType}
              onChange={(e) => setForm({ ...form, soilType: e.target.value })}
            >
              {SOIL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Catatan" hint="Drainase, paparan matahari, irigasi, dll.">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Air menggenang saat hujan deras..."
            />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={createPlot.isPending}>
              {createPlot.isPending ? "Menyimpan..." : "Simpan Petak"}
            </button>
          </div>
        </form>
      </Modal>
      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </>
  );
}
