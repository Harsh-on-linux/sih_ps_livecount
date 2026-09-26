"use client";

import { useMemo, useState } from "react";
import type { PSRow } from "@/lib/sih";

export default function SearchTable({ rows }: { rows: PSRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows.slice(0, 50);
    return rows.filter((r) =>
      `${r.id} ${r.title} ${r.org} ${r.theme} ${r.cat}`.toLowerCase().includes(s)
    ).slice(0, 100);
  }, [q, rows]);
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search PS id, title, org, theme…"
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">PS</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Ideas</th>
              <th className="px-3 py-2">Theme</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2 font-mono">{r.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-zinc-500">{r.org} · {r.cat}</div>
                </td>
                <td className="px-3 py-2 font-semibold">{r.count}/{r.cap}</td>
                <td className="px-3 py-2 text-xs">{r.theme}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Showing {filtered.length} of {rows.length} problem statements.
      </p>
    </div>
  );
}
