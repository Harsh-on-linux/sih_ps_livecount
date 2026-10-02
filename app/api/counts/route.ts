import { getLiveCounts, snapshotCounts } from "@/lib/sih";

export const dynamic = "force-static";
export const revalidate = 1800; // 30min, same as /api/stats

// Lightweight live overlay: only id -> count/cap (~few KB).
// Static PS details come from the repo snapshot (data/ps.json).
export async function GET() {
  try {
    return Response.json(await getLiveCounts());
  } catch {
    return Response.json(snapshotCounts()); // SIH blocked/unreachable: repo snapshot
  }
}
