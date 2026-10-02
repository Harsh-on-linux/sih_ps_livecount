import { getStats, snapshotStats } from "@/lib/sih";

export const dynamic = "force-static";
export const revalidate = 1800; // 30min

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch {
    return Response.json(snapshotStats()); // SIH blocked/unreachable: repo snapshot
  }
}
