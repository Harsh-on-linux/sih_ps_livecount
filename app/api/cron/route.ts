import { revalidatePath, revalidateTag } from "next/cache";

// Triggered by Vercel Cron (daily, Hobby-safe) + GitHub Actions (6h).
// Vercel sends `Authorization: Bearer <CRON_SECRET>`; GitHub/manual use `?secret=`.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const ok =
      req.headers.get("authorization") === `Bearer ${secret}` ||
      url.searchParams.get("secret") === secret;
    if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateTag("sih", "max");
  revalidatePath("/", "page");
  revalidatePath("/api/stats");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
