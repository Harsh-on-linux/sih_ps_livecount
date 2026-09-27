import { getStats, toCompactText } from "@/lib/sih";

export const dynamic = "force-static";
export const revalidate = 1800; // 30min

export async function GET() {
  try {
    const stats = await getStats();
    return new Response(toCompactText(stats), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return new Response(
      `SIH export failed: ${e instanceof Error ? e.message : "fetch failed"}`,
      { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
