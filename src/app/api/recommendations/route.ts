import { evaluateChoice } from "@/lib/rotation";
import { getCrops, getRotationAnalysis } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plotId = url.searchParams.get("plotId");
  const cropId = url.searchParams.get("cropId");
  const limit = Number(url.searchParams.get("limit") ?? 0);

  if (!plotId) {
    return Response.json({ error: "Parameter plotId wajib." }, { status: 400 });
  }
  const analysis = await getRotationAnalysis(Number(plotId));
  if (!analysis) {
    return Response.json({ error: "Petak tidak ditemukan." }, { status: 404 });
  }

  const recommendations =
    limit > 0 ? analysis.recommendations.slice(0, limit) : analysis.recommendations;

  return Response.json({
    analysis,
    recommendations,
    choice: cropId ? evaluateChoice(analysis, Number(cropId)) : null,
  });
}

/** Katalog ringkas untuk dropdown mesin rotasi. */
export async function POST(request: Request) {
  const body = (await request.json()) as { plotId?: number };
  if (!body.plotId) {
    return Response.json({ error: "plotId wajib." }, { status: 400 });
  }
  const analysis = await getRotationAnalysis(body.plotId);
  const crops = await getCrops();
  return Response.json({ analysis, crops });
}
