import { getCrops } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const family = url.searchParams.get("family");
  const search = url.searchParams.get("q");
  let crops = await getCrops();
  if (family && family !== "semua") {
    crops = crops.filter((c) => c.familyName === family);
  }
  if (search) {
    const q = search.toLowerCase();
    crops = crops.filter(
      (c) =>
        c.commonName.toLowerCase().includes(q) ||
        c.familyName.toLowerCase().includes(q),
    );
  }
  return Response.json({ crops });
}
