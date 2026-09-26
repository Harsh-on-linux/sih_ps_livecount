import { getStats } from "@/lib/sih";
import SearchTable from "./components/SearchTable";

export const revalidate = 21600; // 6h ISR, Hobby-safe

export const metadata = {
  title: "SIH 2026 Live Count",
  description: "Live applicant / idea submission count scraped from sih.gov.in",
};

export default async function Home() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">SIH 2026 Live Count</h1>
        <p className="mt-4 text-red-600">Could not reach sih.gov.in right now. Try again later.</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <p className="text-sm text-zinc-500">Source: sih.gov.in/sih2026PS · refreshes every ~6h</p>
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
        {new Date(stats.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
      </p>

      <div className="mt-8">
        <SearchTable rows={stats.rows} />
      </div>

      <footer className="mt-10 text-xs text-zinc-500">
        <a className="underline" href="/api/stats">JSON API</a> · unofficial tracker, data scraped from the public SIH portal.
      </footer>
    </main>
  );
}
