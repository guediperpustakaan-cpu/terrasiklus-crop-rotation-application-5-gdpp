import { getDashboard } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboard();
  return Response.json(data);
}
