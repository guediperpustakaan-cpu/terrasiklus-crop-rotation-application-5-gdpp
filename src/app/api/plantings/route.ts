import { db } from "@/db";
import { plantings } from "@/db/schema";
import { todayISO } from "@/lib/format";
import { evaluateChoice } from "@/lib/rotation";
import { getAllPlantings, getPlotPlantings, getRotationAnalysis } from "@/server/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plotId = url.searchParams.get("plotId");
  const rows = plotId ? await getPlotPlantings(Number(plotId)) : await getAllPlantings();
  return Response.json({ plantings: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plotId?: number | string;
      cropId?: number | string;
      plantedOn?: string;
      harvestedOn?: string | null;
      status?: string;
      notes?: string;
      pestNotes?: string;
      force?: boolean;
    };

    const plotId = Number(body.plotId);
    const cropId = Number(body.cropId);
    if (!plotId || !cropId) {
      return Response.json(
        { error: "Petak dan tanaman wajib dipilih." },
        { status: 400 },
      );
    }
    const plantedOn = body.plantedOn?.trim() || todayISO();

    // Cegah dua tanaman aktif pada petak yang sama
    const existing = await getPlotPlantings(plotId);
    const hasActive = existing.some((p) => p.harvestedOn === null && p.status === "berjalan");
    if (hasActive && !body.force) {
      return Response.json(
        {
          error:
            "Petak ini masih memiliki tanaman aktif. Catat panen terlebih dahulu atau centang 'paksa catat'.",
        },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(plantings)
      .values({
        plotId,
        cropId,
        plantedOn,
        harvestedOn: body.harvestedOn?.trim() || null,
        status: body.harvestedOn ? "panen" : body.status ?? "berjalan",
        notes: body.notes?.trim() || null,
        pestNotes: body.pestNotes?.trim() || null,
      })
      .returning();

    const analysis = await getRotationAnalysis(plotId);
    const choice = analysis ? evaluateChoice(analysis, cropId) : null;

    return Response.json(
      {
        planting: created,
        rotation: choice
          ? {
              score: choice.score,
              status: choice.status,
              reasons: choice.reasons,
              cropName: choice.cropName,
              familyName: choice.familyName,
            }
          : null,
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Gagal mencatat penanaman." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Parameter id wajib." }, { status: 400 });
  await db.delete(plantings).where(eq(plantings.id, Number(id)));
  return Response.json({ ok: true });
}
