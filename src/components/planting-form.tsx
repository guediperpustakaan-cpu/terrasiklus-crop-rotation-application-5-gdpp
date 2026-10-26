"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, CheckCircle2, ShieldAlert, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Alert,
  Chip,
  DEMAND_SHORT,
  demandTone,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  Toast,
} from "@/components/ui";
import { api, qk } from "@/lib/api";
import { formatDateID, todayISO } from "@/lib/format";
import { statusMeta } from "@/lib/rotation";
import type { CropWithFamily, RotationAnalysis } from "@/lib/types";

function pickRotation(analysis: RotationAnalysis | undefined, cropId: string) {
  if (!analysis || !cropId) return null;
  return analysis.recommendations.find((r) => r.cropId === Number(cropId)) ?? null;
}

export function PlantingForm({
  open,
  onClose,
  plotId: fixedPlotId,
  plotName: fixedPlotName,
  crops,
  analysis: externalAnalysis,
  defaultCropId,
  plots,
}: {
  open: boolean;
  onClose: () => void;
  plotId?: number;
  plotName?: string;
  crops: CropWithFamily[];
  analysis?: RotationAnalysis;
  defaultCropId?: number;
  plots?: Array<{ id: number; name: string }>;
}) {
  const queryClient = useQueryClient();
  const [selectedPlot, setSelectedPlot] = useState<number>(
    fixedPlotId ?? plots?.[0]?.id ?? 0,
  );
  const dynamicDetail = useQuery({
    queryKey: qk.plot(selectedPlot),
    queryFn: () => api.plotDetail(selectedPlot),
    enabled: open && !fixedPlotId && selectedPlot > 0,
  });

  const plotId = fixedPlotId ?? selectedPlot;
  const plotName = fixedPlotName ?? dynamicDetail.data?.plot.name ?? "";
  const analysis = externalAnalysis ?? dynamicDetail.data?.rotation;

  const [cropId, setCropId] = useState(defaultCropId ? String(defaultCropId) : "");
  const [plantedOn, setPlantedOn] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [pestNotes, setPestNotes] = useState("");
  const [force, setForce] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const selected = crops.find((c) => c.id === Number(cropId));
  const rotation = useMemo(() => pickRotation(analysis, cropId), [analysis, cropId]);
  const hasActive = analysis?.activePlanting ?? false;

  const createPlanting = useMutation({
    mutationFn: () =>
      api.createPlanting({
        plotId,
        cropId: Number(cropId),
        plantedOn,
        notes,
        pestNotes,
        force,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      const status = result.rotation?.status;
      const label =
        status === "hindari"
          ? "Tercatat dengan peringatan rotasi!"
          : status === "hati-hati"
            ? "Tercatat. Perhatikan saran rotasi."
            : "Penanaman tercatat. Pilihan rotasi bagus!";
      setToast({
        message: result.rotation
          ? `${result.rotation.cropName}: ${label} (skor ${result.rotation.score})`
          : label,
        tone: "success",
      });
      setCropId("");
      setNotes("");
      setPestNotes("");
      setForce(false);
      onClose();
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Catat Penanaman"
        description={
          plotName
            ? `${plotName} · TerraSiklus menilai pilihan Anda berdasarkan riwayat rotasi.`
            : "Pilih petak & tanaman — TerraSiklus menilai pilihan Anda berdasarkan riwayat rotasi."
        }
        size="lg"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createPlanting.mutate();
          }}
        >
          <Field label="Tanaman">
            <Select
              value={cropId}
              onChange={(event) => setCropId(event.target.value)}
              required
            >
              <option value="">— Pilih tanaman —</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.emoji ? `${crop.emoji} ` : ""}
                  {crop.commonName} — {crop.familyName}
                </option>
              ))}
            </Select>
          </Field>

          {selected ? (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-soil-50 px-3 py-2.5">
              <Chip tone="soil">Famili {selected.familyName}</Chip>
              <Chip tone={demandTone(selected.nutrientDemand)}>
                {DEMAND_SHORT[selected.nutrientDemand]}
              </Chip>
              {selected.daysToHarvest ? (
                <Chip tone="green">± {selected.daysToHarvest} hari</Chip>
              ) : null}
              {selected.minPh !== null && selected.maxPh !== null ? (
                <Chip tone="blue">pH {selected.minPh}–{selected.maxPh}</Chip>
              ) : null}
            </div>
          ) : null}

          {rotation ? (
            rotation.status === "hindari" ? (
              <Alert tone="danger" title={`Peringatan rotasi: ${statusMeta(rotation.status).label}`}>
                <ul className="mt-1 space-y-1">
                  {rotation.reasons.slice(0, 3).map((reason, index) => (
                    <li key={index} className="flex gap-1.5">
                      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{reason.label}</span>
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : rotation.status === "hati-hati" ? (
              <Alert tone="warning" title="Perlu pertimbangan">
                <ul className="mt-1 space-y-1">
                  {rotation.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{reason.label}</span>
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : (
              <Alert tone="success" title={`Bagus! Skor rotasi ${rotation.score}/100`}>
                <ul className="mt-1 space-y-1">
                  {rotation.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index} className="flex gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{reason.label}</span>
                    </li>
                  ))}
                </ul>
              </Alert>
            )
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tanggal tanam">
              <Input
                type="date"
                value={plantedOn}
                onChange={(event) => setPlantedOn(event.target.value)}
                required
              />
            </Field>
            <Field label="Prediksi panen">
              <div className="input flex items-center gap-2 bg-soil-50 text-soil-500">
                <CalendarDays className="h-4 w-4" />
                {selected?.daysToHarvest
                  ? formatDateID(
                      new Date(
                        new Date(`${plantedOn}T00:00:00Z`).getTime() +
                          selected.daysToHarvest * 86_400_000,
                      )
                        .toISOString()
                        .slice(0, 10),
                    )
                  : "Pilih tanaman dahulu"}
              </div>
            </Field>
          </div>

          <Field label="Catatan budidaya">
            <Textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Jarak tanam 40x60 cm, pupuk kandang 2 kg/m²..."
            />
          </Field>

          <Field label="Catatan hama / penyakit" hint="Penting untuk analisis rotasi berikutnya.">
            <Textarea
              rows={2}
              value={pestNotes}
              onChange={(event) => setPestNotes(event.target.value)}
              placeholder="Lalat buah menyerang 20% buah..."
            />
          </Field>

          {hasActive ? (
            <label className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-900">
              <input
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-amber-600"
              />
              <span>
                Petak ini masih memiliki tanaman aktif. Centang untuk tetap mencatat
                penanaman (misalnya tanaman tumpang sari).
              </span>
            </label>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!cropId || createPlanting.isPending}
            >
              <Sprout className="h-4 w-4" />
              {createPlanting.isPending ? "Menyimpan..." : "Simpan Penanaman"}
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

export function HarvestModal({
  open,
  onClose,
  plantingId,
  cropName,
  plantedOn,
}: {
  open: boolean;
  onClose: () => void;
  plantingId: number;
  cropName: string;
  plantedOn: string;
}) {
  const queryClient = useQueryClient();
  const [harvestedOn, setHarvestedOn] = useState(todayISO());
  const [yieldKg, setYieldKg] = useState("");
  const [pestNotes, setPestNotes] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const harvest = useMutation({
    mutationFn: () =>
      api.harvestPlanting(plantingId, { harvestedOn, yieldKg, pestNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setToast({ message: `Panen ${cropName} berhasil dicatat.`, tone: "success" });
      setYieldKg("");
      setPestNotes("");
      onClose();
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Catat Panen"
        description={`${cropName} · ditanam ${formatDateID(plantedOn)}`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            harvest.mutate();
          }}
        >
          <Field label="Tanggal panen">
            <Input
              type="date"
              value={harvestedOn}
              onChange={(event) => setHarvestedOn(event.target.value)}
              required
            />
          </Field>
          <Field label="Hasil panen (kg)" hint="Kosongkan bila tidak diukur.">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={yieldKg}
              onChange={(event) => setYieldKg(event.target.value)}
              placeholder="12.5"
            />
          </Field>
          <Field label="Catatan hama / penyakit selama musim ini">
            <Textarea
              rows={2}
              value={pestNotes}
              onChange={(event) => setPestNotes(event.target.value)}
              placeholder="Ulat grayak muncul di minggu ke-3..."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={harvest.isPending}>
              {harvest.isPending ? "Menyimpan..." : "Konfirmasi Panen"}
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
