import { seedDemoData } from "@/db/seed";
import { getFarms } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await seedDemoData();
    const farms = await getFarms();
    return Response.json({ ...result, farms });
  } catch {
    return Response.json({ error: "Gagal memuat data contoh." }, { status: 500 });
  }
}
