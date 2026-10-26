import { db } from "@/db";
import { plots } from "@/db/schema";
import {
  getPlotPlantings,
  getPlotRaw,
  getPlotSoilTests,
  getRotationAnalysis,
} from "@/server/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const plotId = Number(id);
  const raw = await getPlotRaw(plotId);
  if (!raw) return Response.json({ error: "Petak tidak ditemukan." }, { status: 404 });
  const [history, soil, rotation] = await Promise.all([
    getPlotPlantings(plotId),
    getPlotSoilTests(plotId),
    getRotationAnalysis(plotId),
  ]);
  return Response.json({ plot: raw.plot, farmName: raw.farmName, history, soil, rotation });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    area?: string | number;
    areaUnit?: string;
    soilType?: string;
    notes?: string;
  };
  const [updated] = await db
    .update(plots)
    .set({
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.area !== undefined
        ? { area: body.area === "" || body.area === null ? null : String(body.area) }
        : {}),
      ...(body.areaUnit ? { areaUnit: body.areaUnit } : {}),
      ...(body.soilType !== undefined ? { soilType: body.soilType } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    })
    .where(eq(plots.id, Number(id)))
    .returning();
  if (!updated) return Response.json({ error: "Petak tidak ditemukan." }, { status: 404 });
  return Response.json({ plot: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await db.delete(plots).where(eq(plots.id, Number(id)));
  return Response.json({ ok: true });
}
