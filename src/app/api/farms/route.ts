import { db } from "@/db";
import { farms } from "@/db/schema";
import { ensureProfile } from "@/db/seed";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const profileId = await ensureProfile();
  const rows = await db
    .select()
    .from(farms)
    .where(eq(farms.ownerId, profileId))
    .orderBy(asc(farms.id));
  return Response.json({ farms: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      location?: string;
      description?: string;
    };
    const name = body.name?.trim();
    if (!name) {
      return Response.json({ error: "Nama kebun wajib diisi." }, { status: 400 });
    }
    const profileId = await ensureProfile();
    const [created] = await db
      .insert(farms)
      .values({
        ownerId: profileId,
        name,
        location: body.location?.trim() || null,
        description: body.description?.trim() || null,
      })
      .returning();

    return Response.json({ farm: created }, { status: 201 });
  } catch {
    return Response.json({ error: "Gagal membuat kebun." }, { status: 500 });
  }
}
