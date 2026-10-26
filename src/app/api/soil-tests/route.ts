import { db } from "@/db";
import { soilTests } from "@/db/schema";
import { todayISO } from "@/lib/format";
import { soilHealthScore, soilInsights } from "@/lib/soil";
import { getPlotSoilTests } from "@/server/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plotId = url.searchParams.get("plotId");
  if (!plotId) {
    return Response.json({ error: "Parameter plotId wajib." }, { status: 400 });
  }
  const tests = await getPlotSoilTests(Number(plotId));
  return Response.json({ soilTests: tests });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plotId?: number | string;
      testedOn?: string;
      ph?: string | number;
      n?: string | number;
      p?: string | number;
      k?: string | number;
      organicMatter?: string | number;
      notes?: string;
    };

    const plotId = Number(body.plotId);
    const ph = Number(body.ph);
    if (!plotId) {
      return Response.json({ error: "Petak wajib dipilih." }, { status: 400 });
    }
    if (Number.isNaN(ph) || ph < 0 || ph > 14) {
      return Response.json({ error: "pH harus angka antara 0 dan 14." }, { status: 400 });
    }

    const optional = (value: string | number | undefined): string | null => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : String(parsed);
    };

    const values = {
      plotId,
      testedOn: body.testedOn?.trim() || todayISO(),
      ph: String(ph),
      n: optional(body.n),
      p: optional(body.p),
      k: optional(body.k),
      organicMatter: optional(body.organicMatter),
      notes: body.notes?.trim() || null,
    };

    const [created] = await db.insert(soilTests).values(values).returning();
    const record = {
      id: created.id,
      plotId: created.plotId,
      testedOn: created.testedOn,
      ph: Number(created.ph),
      n: created.n === null ? null : Number(created.n),
      p: created.p === null ? null : Number(created.p),
      k: created.k === null ? null : Number(created.k),
      organicMatter: created.organicMatter === null ? null : Number(created.organicMatter),
      notes: created.notes,
    };

    return Response.json(
      {
        soilTest: record,
        score: soilHealthScore(record),
        insights: soilInsights(record),
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Gagal menyimpan uji tanah." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Parameter id wajib." }, { status: 400 });
  await db.delete(soilTests).where(eq(soilTests.id, Number(id)));
  return Response.json({ ok: true });
}
