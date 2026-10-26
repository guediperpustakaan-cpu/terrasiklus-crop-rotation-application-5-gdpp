import { db } from "@/db";
import { plots } from "@/db/schema";
import { getAllPlotSummaries } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const farmId = url.searchParams.get("farmId");
  const summaries = await getAllPlotSummaries();
  const filtered =
    farmId !== null ? summaries.filter((s) => s.farmId === Number(farmId)) : summaries;
  return Response.json({ plots: filtered });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      farmId?: number | string;
      name?: string;
      area?: string | number;
      areaUnit?: string;
      soilType?: string;
      notes?: string;
    };
    const farmId = Number(body.farmId);
    const name = body.name?.trim();
    if (!farmId || Number.isNaN(farmId)) {
      return Response.json({ error: "Kebun belum dipilih." }, { status: 400 });
    }
    if (!name) {
      return Response.json({ error: "Nama petak wajib diisi." }, { status: 400 });
    }
    const area =
      body.area === undefined || body.area === null || body.area === ""
        ? null
        : String(body.area);

    const [created] = await db
      .insert(plots)
      .values({
        farmId,
        name,
        area,
        areaUnit: body.areaUnit?.trim() || "m2",
        soilType: body.soilType?.trim() || null,
        notes: body.notes?.trim() || null,
      })
      .returning();
    return Response.json({ plot: created }, { status: 201 });
  } catch {
    return Response.json({ error: "Gagal membuat petak." }, { status: 500 });
  }
}
