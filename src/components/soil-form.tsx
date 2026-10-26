"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Field, Input, MeterBar, Modal, Textarea, Toast } from "@/components/ui";
import { api, qk } from "@/lib/api";
import { todayISO } from "@/lib/format";
import {
  nutrientAdvice,
  organicMatterAdvice,
  phLabel as phAdviceLabel,
  soilHealthScore,
  SOIL_IDEAL,
} from "@/lib/soil";

type SoilFormValues = {
  testedOn: string;
  ph: string;
  n: string;
  p: string;
  k: string;
  organicMatter: string;
  notes: string;
};

const EMPTY: SoilFormValues = {
  testedOn: todayISO(),
  ph: "6.5",
  n: "20",
  p: "18",
  k: "15",
  organicMatter: "3",
  notes: "",
};

export function SoilForm({
  open,
  onClose,
  plotId,
  plotName,
}: {
  open: boolean;
  onClose: () => void;
  plotId: number;
  plotName: string;
}) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SoilFormValues>(EMPTY);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const set = (key: keyof SoilFormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(() => {
    const ph = Number(values.ph);
    if (Number.isNaN(ph)) return null;
    return {
      ph,
      n: values.n === "" ? null : Number(values.n),
      p: values.p === "" ? null : Number(values.p),
      k: values.k === "" ? null : Number(values.k),
      organicMatter: values.organicMatter === "" ? null : Number(values.organicMatter),
    };
  }, [values]);

  const score = preview ? soilHealthScore(preview) : 0;

  const save = useMutation({
    mutationFn: () => api.createSoilTest({ plotId, ...values }),
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      setToast({ message: `Uji tanah tersimpan. Skor kesehatan tanah: ${result.score}/100.`, tone: "success" });
      setValues(EMPTY);
      onClose();
    },
    onError: (error: Error) => setToast({ message: error.message, tone: "error" }),
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Catat Hasil Uji Tanah"
        description={`${plotName} · hasil uji dipakai mesin rotasi untuk menyaring tanaman.`}
        size="lg"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tanggal uji">
              <Input
                type="date"
                value={values.testedOn}
                onChange={(event) => set("testedOn")(event.target.value)}
                required
              />
            </Field>
            <Field label="pH tanah" hint="Ideal 6,0 – 7,0">
              <Input
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={values.ph}
                onChange={(event) => set("ph")(event.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nitrogen (ppm)" hint="Ideal 15–35">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={values.n}
                onChange={(event) => set("n")(event.target.value)}
              />
            </Field>
            <Field label="Fosfor (ppm)" hint="Ideal 12–30">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={values.p}
                onChange={(event) => set("p")(event.target.value)}
              />
            </Field>
            <Field label="Kalium (ppm)" hint="Ideal 10–25">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={values.k}
                onChange={(event) => set("k")(event.target.value)}
              />
            </Field>
          </div>

          <Field label="Bahan organik (%)" hint="Ideal 2,5 – 5%">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={values.organicMatter}
              onChange={(event) => set("organicMatter")(event.target.value)}
            />
          </Field>

          {preview ? (
            <div className="rounded-2xl border border-leaf-100 bg-leaf-50/60 p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold text-leaf-800">
                  <FlaskConical className="h-4 w-4" /> Pratinjau skor kesehatan tanah
                </p>
                <span className="text-lg font-extrabold text-leaf-700">{score}/100</span>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                    <span>pH {preview.ph}</span>
                    <span>{phAdviceLabel(preview.ph)}</span>
                  </div>
                  <MeterBar value={preview.ph} min={4} max={9} ideal={[SOIL_IDEAL.ph.min, SOIL_IDEAL.ph.max]} />
                </div>
                {preview.n !== null ? (
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                      <span>Nitrogen {preview.n} ppm</span>
                    </div>
                    <MeterBar value={preview.n} min={0} max={60} ideal={[SOIL_IDEAL.n.min, SOIL_IDEAL.n.max]} color="#3b82f6" />
                  </div>
                ) : null}
                {preview.p !== null ? (
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                      <span>Fosfor {preview.p} ppm</span>
                    </div>
                    <MeterBar value={preview.p} min={0} max={60} ideal={[SOIL_IDEAL.p.min, SOIL_IDEAL.p.max]} color="#a855f7" />
                  </div>
                ) : null}
                {preview.k !== null ? (
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                      <span>Kalium {preview.k} ppm</span>
                    </div>
                    <MeterBar value={preview.k} min={0} max={60} ideal={[SOIL_IDEAL.k.min, SOIL_IDEAL.k.max]} color="#f97316" />
                  </div>
                ) : null}
                {preview.organicMatter !== null ? (
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-soil-600">
                      <span>Bahan organik {preview.organicMatter}%</span>
                    </div>
                    <MeterBar
                      value={preview.organicMatter}
                      min={0}
                      max={10}
                      ideal={[SOIL_IDEAL.organicMatter.min, SOIL_IDEAL.organicMatter.max]}
                      color="#92400e"
                    />
                  </div>
                ) : null}
              </div>

              <ul className="mt-3 space-y-1 border-t border-leaf-100 pt-3 text-[11px] text-soil-600">
                <li className="flex gap-1.5">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-leaf-600" />
                  {nutrientAdvice("n", preview.n ?? 20)}
                </li>
                {preview.organicMatter !== null ? (
                  <li className="flex gap-1.5">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-leaf-600" />
                    {organicMatterAdvice(preview.organicMatter)}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <Field label="Catatan uji">
            <Textarea
              rows={2}
              value={values.notes}
              onChange={(event) => set("notes")(event.target.value)}
              placeholder="Sampel diambil dari 3 titik, kedalaman 15 cm..."
            />
          </Field>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={save.isPending}>
              <FlaskConical className="h-4 w-4" />
              {save.isPending ? "Menyimpan..." : "Simpan Uji Tanah"}
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
