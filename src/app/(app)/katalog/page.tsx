"use client";

import { useQuery } from "@tanstack/react-query";
import { Library, Search, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  Chip,
  DEMAND_SHORT,
  demandTone,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  SOIL_IMPACT_LABEL,
} from "@/components/ui";
import { api, qk } from "@/lib/api";

export default function KatalogPage() {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("semua");
  const [demand, setDemand] = useState("semua");

  const crops = useQuery({ queryKey: qk.crops, queryFn: api.crops });

  const families = useMemo(() => {
    const map = new Map<string, { name: string; localName: string | null; count: number }>();
    for (const crop of crops.data?.crops ?? []) {
      const entry = map.get(crop.familyName);
      if (entry) entry.count += 1;
      else
        map.set(crop.familyName, {
          name: crop.familyName,
          localName: crop.familyLocalName,
          count: 1,
        });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [crops.data]);

  const filtered = useMemo(() => {
    const list = crops.data?.crops ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((crop) => {
      if (family !== "semua" && crop.familyName !== family) return false;
      if (demand !== "semua" && crop.nutrientDemand !== demand) return false;
      if (!q) return true;
      return (
        crop.commonName.toLowerCase().includes(q) ||
        crop.familyName.toLowerCase().includes(q) ||
        (crop.familyLocalName ?? "").toLowerCase().includes(q)
      );
    });
  }, [crops.data, search, family, demand]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const crop of filtered) {
      const list = map.get(crop.familyName) ?? [];
      list.push(crop);
      map.set(crop.familyName, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div>
      <PageHeader
        eyebrow="Data Referensi"
        title="Katalog Tanaman"
        description="45 tanaman hortikultura Indonesia yang dikelompokkan menurut famili botani, kebutuhan hara, dan dampaknya pada tanah."
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-soil-400" />
            <Input
              className="pl-9"
              placeholder="Cari tanaman atau famili..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={family} onChange={(event) => setFamily(event.target.value)}>
            <option value="semua">Semua famili</option>
            {families.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name} ({item.count})
              </option>
            ))}
          </Select>
          <Select value={demand} onChange={(event) => setDemand(event.target.value)}>
            <option value="semua">Semua kebutuhan hara</option>
            <option value="tinggi">Hara tinggi (tanaman berat)</option>
            <option value="sedang">Hara sedang</option>
            <option value="rendah">Hara rendah (tanaman ringan)</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-soil-100 pt-3">
          <Chip tone="green">{filtered.length} tanaman</Chip>
          <Chip tone="soil">{grouped.length} famili tampil</Chip>
          {search || family !== "semua" || demand !== "semua" ? (
            <button
              className="text-xs font-bold text-leaf-700 hover:underline"
              onClick={() => {
                setSearch("");
                setFamily("semua");
                setDemand("semua");
              }}
            >
              Reset filter
            </button>
          ) : null}
        </div>
      </Card>

      {crops.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Library className="h-7 w-7" />}
          title="Tidak ada tanaman cocok"
          description="Coba ubah kata kunci atau filter famili."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([familyName, list]) => {
            const first = list[0];
            return (
              <section key={familyName}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="section-title">{familyName}</h2>
                  <Chip tone="blue">{first.familyLocalName ?? "Famili"}</Chip>
                  <Chip tone="soil">{list.length} tanaman</Chip>
                </div>
                {first.familyDescription ? (
                  <p className="mb-3 max-w-3xl text-sm text-soil-500">
                    {first.familyDescription}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((crop) => (
                    <Card key={crop.id} hover className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-2xl">
                          {crop.emoji ?? "🌱"}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-soil-900">
                            {crop.commonName}
                          </h3>
                          <p className="text-[11px] text-soil-400">{crop.familyName}</p>
                        </div>
                      </div>
                      {crop.description ? (
                        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-soil-500">
                          {crop.description}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Chip tone={demandTone(crop.nutrientDemand)}>
                          {DEMAND_SHORT[crop.nutrientDemand]}
                        </Chip>
                        <Chip tone={crop.soilImpact === "pembenah" ? "green" : "soil"}>
                          {SOIL_IMPACT_LABEL[crop.soilImpact]}
                        </Chip>
                        {crop.daysToHarvest ? (
                          <Chip tone="blue">± {crop.daysToHarvest} hari</Chip>
                        ) : null}
                        {crop.minPh !== null && crop.maxPh !== null ? (
                          <Chip tone="soil">
                            pH {crop.minPh}–{crop.maxPh}
                          </Chip>
                        ) : null}
                      </div>
                      {crop.familyPestRisk ? (
                        <p className="mt-3 border-t border-soil-100 pt-2.5 text-[11px] text-soil-500">
                          <strong className="text-soil-700">Hama khas famili:</strong>{" "}
                          {crop.familyPestRisk}
                        </p>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Card className="mt-8 flex items-start gap-3 bg-leaf-50/60 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-leaf-700 shadow-sm">
          <Sprout className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-soil-900">Kenapa famili botani penting?</h3>
          <p className="mt-1 text-sm text-soil-600">
            Tanaman satu famili berbagi hama, penyakit, dan pola hara yang sama. Menanam
            famili yang sama berulang di petak yang sama membuat patogen menumpuk di tanah
            dan hara tertentu habis. TerraSiklus memakai famili sebagai dasar utama rotasi.
          </p>
        </div>
      </Card>
    </div>
  );
}
