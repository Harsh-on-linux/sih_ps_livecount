"use client";

import { useMemo, useState } from "react";
import type { PSRow } from "@/lib/sih";
import LlmExport from "./LlmExport";

export default function SearchTable({ rows }: { rows: PSRow[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [dept, setDept] = useState("All");
  const [sort, setSort] = useState("ideas-desc");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const depts = useMemo(
    () => [...new Set(rows.map((r) => r.dept).filter(Boolean))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = rows;
    if (cat !== "All") out = out.filter((r) => r.cat === cat);
    if (dept !== "All") out = out.filter((r) => r.dept === dept);
    if (s)
      out = out.filter((r) =>
        `${r.id} ${r.title} ${r.org} ${r.dept} ${r.theme} ${r.cat}`
          .toLowerCase()
          .includes(s)
      );
    out = [...out];
    if (sort === "ideas-desc") out.sort((a, b) => b.count - a.count);
    else if (sort === "ideas-asc") out.sort((a, b) => a.count - b.count);
    else if (sort === "id-asc") out.sort((a, b) => a.id.localeCompare(b.id));
    return out;
  }, [q, cat, dept, sort, rows]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const reset = () => setPage(1);

  const select =
    "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <div>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          reset();
        }}
        placeholder="Search PS id, title, org, dept, theme…"
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <select value={cat} onChange={(e) => { setCat(e.target.value); reset(); }} className={select} aria-label="Category">
          <option value="All">All categories</option>
          <option value="Software">Software</option>
          <option value="Hardware">Hardware</option>
        </select>
        <select value={dept} onChange={(e) => { setDept(e.target.value); reset(); }} className={select} aria-label="Department">
          <option value="All">All departments ({depts.length})</option>
          {depts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={select} aria-label="Sort">
          <option value="ideas-desc">Most applicants first</option>
          <option value="ideas-asc">Fewest applicants first</option>
          <option value="id-asc">PS number order</option>
        </select>
      </div>
      <div className="mt-3">
        <LlmExport rows={filtered} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">PS</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Ideas</th>
              <th className="px-3 py-2">Theme</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2 font-mono">
                  <a
                    href="https://sih.gov.in/sih2026PS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-600"
                  >
                    {r.id}
                  </a>
                </td>
                <td className="px-3 py-2">
                  <a
                    href="https://sih.gov.in/sih2026PS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </a>
                  <div className="text-xs text-zinc-500">{r.org} · {r.dept}</div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.cat === "Hardware"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {r.cat}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold">{r.count}/{r.cap}</td>
                <td className="px-3 py-2 text-xs">{r.theme}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        Showing {visible.length} of {filtered.length} (all {rows.length}) problem statements.
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <button
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-700"
        >
          Prev
        </button>
        <span className="text-xs text-zinc-500">
          Page {safePage} of {pages}
        </span>
        <button
          disabled={safePage >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
