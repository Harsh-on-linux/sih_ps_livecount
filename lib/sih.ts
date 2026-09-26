import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";

export type PSRow = {
  org: string;
  title: string;
  cat: string;
  id: string;
  count: number;
  cap: number;
  theme: string;
};

export type Stats = {
  totalIdeas: number;
  totalCapacity: number;
  totalApplicants: number; // ponytail: 6 members per team, estimate = ideas*6
  psCount: number;
  updatedAt: string;
  rows: PSRow[];
};

const SOURCE = "https://sih.gov.in/sih2026PS";

async function fetchStats(): Promise<Stats> {
  const res = await fetch(SOURCE, {
    headers: { "User-Agent": "Mozilla/5.0 SIH-livecount" },
  });
  if (!res.ok) throw new Error(`SIH fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const table = $("th")
    .filter((_, el) => $(el).text().includes("Submitted Idea"))
    .closest("table")
    .first();
  const rows: PSRow[] = [];
  table.find("> tbody > tr").each((_, tr) => {
    const tds = $(tr).children("td");
    if (tds.length < 6) return;
    const id = $(tds[4]).text().trim();
    const m = $(tds[5]).text().trim().match(/(\d+)\s*\/\s*(\d+)/);
    if (!/^SIH26\d+$/.test(id) || !m) return;
    rows.push({
      org: $(tds[1]).text().trim(),
      title: $(tds[2]).find("a").first().text().trim(),
      cat: $(tds[3]).text().trim(),
      id,
      count: +m[1],
      cap: +m[2],
      theme: tds.length > 6 ? $(tds[6]).text().trim() : "",
    });
  });
  if (!rows.length) throw new Error("SIH parse returned 0 rows");
  const totalIdeas = rows.reduce((a, r) => a + r.count, 0);
  return {
    totalIdeas,
    totalCapacity: rows.reduce((a, r) => a + r.cap, 0),
    totalApplicants: totalIdeas * 6,
    psCount: rows.length,
    updatedAt: new Date().toISOString(),
    rows: rows.sort((a, b) => b.count - a.count),
  };
}

// 6h cache, Hobby-safe (long interval = fewer ISR writes). ponytail: no DB, cache is the DB.
export const getStats = unstable_cache(fetchStats, ["sih-stats"], {
  tags: ["sih"],
  revalidate: 21600,
});
