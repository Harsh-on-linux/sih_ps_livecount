// One-off snapshot: fetch all PS details from sih.gov.in and commit data/ps.json.
// Usage: npm run fetch-ps
// Static fields (title/org/dept/theme/description/...) change rarely and are
// served from the repo. Only live submission counts are fetched at runtime
// via /api/counts.
import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = "https://sih.gov.in/sih2026PS";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "ps.json");

const res = await fetch(SOURCE, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    Accept: "text/html",
  },
});
if (!res.ok) throw new Error(`SIH fetch failed: ${res.status}`);
const html = await res.text();
const $ = cheerio.load(html);

const table = $("th")
  .filter((_, el) => $(el).text().includes("Submitted Idea"))
  .closest("table")
  .first();

const rows = [];
table.find("> tbody > tr").each((_, tr) => {
  const tds = $(tr).children("td");
  if (tds.length < 6) return;
  const id = $(tds[4]).text().trim();
  const m = $(tds[5]).text().trim().match(/(\d+)\s*\/\s*(\d+)/);
  if (!/^SIH26\d+$/.test(id) || !m) return;

  const titleCell = $(tds[2]);
  const modal = titleCell.find('div[id^="ViewProblemStatement"]').first();
  // ponytail: modal detail table is th-label / td-value rows
  const detail = {};
  modal.find("tr").each((_, dtr) => {
    const th = $(dtr).children("th").first().text().trim().toLowerCase();
    const td = $(dtr).children("td").first();
    if (th.includes("description")) {
      const box = td.find(".style-2").first();
      detail.descriptionHtml = (box.html() || "").trim();
      detail.description = (box.text() || "").replace(/\s+/g, " ").trim();
    } else if (th.includes("organization")) detail.orgModal = td.text().trim();
    else if (th.includes("department")) detail.dept = td.text().trim();
    else if (th.includes("youtube")) detail.youtube = (td.find("a").attr("href") || td.text() || "").trim();
    else if (th.includes("dataset")) {
      detail.dataset = td.text().replace(/\s+/g, " ").trim();
      detail.datasetLinks = td.find("a").map((__, a) => $(a).attr("href")).get().filter(Boolean);
    } else if (th.includes("contact")) detail.contact = td.text().replace(/\s+/g, " ").trim();
  });

  rows.push({
    id,
    sno: $(tds[0]).text().trim(),
    title: titleCell.find("a").first().text().trim(),
    org: $(tds[1]).text().trim(),
    dept: detail.dept || $(tds[1]).text().trim(),
    cat: $(tds[3]).text().trim().toLowerCase() === "hardware" ? "Hardware" : "Software",
    theme: tds.length > 6 ? $(tds[6]).text().trim() : "",
    deadline: tds.length > 7 ? $(tds[7]).text().trim() : "",
    descriptionHtml: detail.descriptionHtml || "",
    description: detail.description || "",
    youtube: detail.youtube || "",
    dataset: detail.dataset || "",
    datasetLinks: detail.datasetLinks || [],
    contact: detail.contact || "",
    // snapshot so pages render from repo even with no network; refreshed live via /api/counts
    count: +m[1],
    cap: +m[2],
  });
});

if (!rows.length) throw new Error("SIH parse returned 0 rows");
rows.sort((a, b) => a.id.localeCompare(b.id));
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), count: rows.length, rows }, null, 1));
console.log(`wrote ${rows.length} PS -> ${OUT}`);
