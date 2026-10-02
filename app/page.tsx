import psData from "@/data/ps.json";
import { getLiveCounts, type PSDetail } from "@/lib/sih";
import SearchTable from "./components/SearchTable";

export const revalidate = 1800; // 30min ISR

export const metadata = {
  title: "SIH 2026 Live Count",
  description: "Live applicant / idea submission count scraped from sih.gov.in",
};

export default async function Home() {
  // Static details come from the repo snapshot; only live counts hit SIH.
  const staticRows = psData.rows as PSDetail[];
  let rows = [...staticRows].sort((a, b) => b.count - a.count);
  let updatedAt: string = psData.fetchedAt;
  let live = false;
  try {
    const lc = await getLiveCounts();
    rows = staticRows
      .map((r) => ({
        ...r,
        count: lc.counts[r.id]?.count ?? r.count,
        cap: lc.counts[r.id]?.cap ?? r.cap,
      }))
      .sort((a, b) => b.count - a.count);
    updatedAt = lc.updatedAt;
    live = lc.live;
  } catch {
    // SIH unreachable: render repo snapshot.
  }
  const totalIdeas = rows.reduce((a, r) => a + r.count, 0);
  const totalCapacity = rows.reduce((a, r) => a + r.cap, 0);
  const stats = {
    totalApplicants: totalIdeas * 6,
    totalIdeas,
    psCount: rows.length,
    totalCapacity,
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <p className="text-sm text-zinc-500">Source: sih.gov.in/sih2026PS · refreshes every ~30 min</p>
      <h1 className="mt-1 text-3xl font-bold">SIH 2026 Live Count</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Applicants*", stats.totalApplicants.toLocaleString("en-IN")],
          ["Teams / Ideas", stats.totalIdeas.toLocaleString("en-IN")],
          ["Problem statements", String(stats.psCount)],
          ["Capacity", stats.totalCapacity.toLocaleString("en-IN")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        *Applicants ≈ teams × 6 (SIH teams have exactly 6 members). Updated:{" "}
        {new Date(updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        {live ? "" : " (repo snapshot — SIH unreachable)"}
      </p>

      <div className="mt-8">
        <SearchTable rows={rows} />
      </div>

      <footer className="mt-10 text-xs text-zinc-500">
        <a className="underline" href="/api/stats">JSON API</a> · unofficial tracker, data scraped from the public SIH portal.
      </footer>
    </main>
  );
}
