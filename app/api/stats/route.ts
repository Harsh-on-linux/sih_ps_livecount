import { getStats } from "@/lib/sih";

export const dynamic = "force-static";
export const revalidate = 21600; // 6h, Hobby-safe

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "fetch failed" },
      { status: 502 }
    );
  }
}
