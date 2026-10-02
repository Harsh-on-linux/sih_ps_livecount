import { getStats, snapshotStats, toCompactText } from "@/lib/sih";

export const dynamic = "force-static";
export const revalidate = 1800; // 30min

export async function GET() {
  try {
    const stats = await getStats();
    return new Response(toCompactText(stats), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response(toCompactText(snapshotStats()), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
