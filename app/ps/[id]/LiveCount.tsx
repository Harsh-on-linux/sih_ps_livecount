"use client";

import { useEffect, useState } from "react";
import type { LiveCounts } from "@/lib/sih";

// Client island: overlays the repo snapshot count with the live number.
// Falls back to the snapshot silently if the live fetch fails.
export default function LiveCount({ id, count, cap }: { id: string; count: number; cap: number }) {
  const [live, setLive] = useState<{ count: number; cap: number } | null>(null);
  useEffect(() => {
    let dead = false;
    fetch("/api/counts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: LiveCounts | null) => {
        // ponytail: snapshot fallback has live:false — overlay numbers but no badge
        if (!dead && j?.counts?.[id] && j.live !== false) setLive(j.counts[id]);
      })
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, [id]);
  const c = live ?? { count, cap };
  return (
    <span className="font-semibold">
      {c.count}/{c.cap}
      {live && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">live</span>}
    </span>
  );
}
