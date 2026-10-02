"use client";

import { useState } from "react";
import type { PSRow } from "@/lib/sih";

export default function LlmExport({ rows }: { rows: PSRow[] }) {
  const [copied, setCopied] = useState(false);
  function text() {
    const head = `SIH 2026 problem statements (${rows.length} selected). Count = submitted ideas/500 per PS (lower = less competition). Teams of 6.\nFormat: ID | S=Software H=Hardware | Theme | count/cap | Organization | Title\n`;
    return (
      head +
      rows
        .map(
          (r) =>
            `${r.id} | ${r.cat === "Hardware" ? "H" : "S"} | ${r.theme} | ${r.count}/${r.cap} | ${r.org} | ${r.title}`
        )
        .join("\n") +
      "\n"
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 2000);
  }
  function download() {
    const blob = new Blob([text()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sih2026.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const btn =
    "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={copy} className={btn}>
        {copied ? "Copied!" : `Copy ${rows.length} for LLM`}
      </button>
      <button onClick={download} className={btn}>
        Download .txt
      </button>
    </div>
  );
}
