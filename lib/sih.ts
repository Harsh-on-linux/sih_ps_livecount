import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";

export type PSRow = {
  org: string;
  dept: string;
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

async function fetchSource(): Promise<string> {
  let lastErr: unknown = new Error("SIH fetch failed");
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(SOURCE, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`SIH fetch failed: ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      console.error(`SIH fetch attempt ${i + 1} failed:`, e);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("SIH fetch failed");
}

async function fetchStats(): Promise<Stats> {
  const html = await fetchSource();
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
    const deptTh = $(tr)
      .find("th")
      .filter((_, el) => $(el).text().trim() === "Department");
    rows.push({
      org: $(tds[1]).text().trim(),
      dept: deptTh.closest("tr").find("td").first().text().trim() || $(tds[1]).text().trim(),
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

// 30min cache. ponytail: no DB, cache is the DB.
export const getStats = unstable_cache(fetchStats, ["sih-stats"], {
  tags: ["sih"],
  revalidate: 1800,
});
