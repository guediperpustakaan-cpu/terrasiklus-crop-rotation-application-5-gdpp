import { db } from "@/db";
import { farms } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const [farm] = await db
    .select()
    .from(farms)
    .where(eq(farms.id, Number(id)));
  if (!farm) return Response.json({ error: "Kebun tidak ditemukan." }, { status: 404 });
  return Response.json({ farm });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    location?: string;
    description?: string;
  };
  const [updated] = await db
    .update(farms)
    .set({
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    })
    .where(eq(farms.id, Number(id)))
    .returning();
  if (!updated) return Response.json({ error: "Kebun tidak ditemukan." }, { status: 404 });
  return Response.json({ farm: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await db.delete(farms).where(eq(farms.id, Number(id)));
  return Response.json({ ok: true });
}
