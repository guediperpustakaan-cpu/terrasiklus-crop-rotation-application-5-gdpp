import { db } from "@/db";
import { plantings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as {
    harvestedOn?: string | null;
    status?: string;
    yieldKg?: string | number | null;
    notes?: string | null;
    pestNotes?: string | null;
  };

  const [updated] = await db
    .update(plantings)
    .set({
      ...(body.harvestedOn !== undefined ? { harvestedOn: body.harvestedOn } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.yieldKg !== undefined
        ? {
            yieldKg:
              body.yieldKg === null || body.yieldKg === "" ? null : String(body.yieldKg),
          }
        : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.pestNotes !== undefined ? { pestNotes: body.pestNotes } : {}),
    })
    .where(eq(plantings.id, Number(id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Riwayat tanam tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ planting: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await db.delete(plantings).where(eq(plantings.id, Number(id)));
  return Response.json({ ok: true });
}
