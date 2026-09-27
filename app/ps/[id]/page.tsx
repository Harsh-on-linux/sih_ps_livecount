import { notFound } from "next/navigation";
import Link from "next/link";
import psData from "@/data/ps.json";
import type { PSDetail } from "@/lib/sih";
import LiveCount from "./LiveCount";

const rows = psData.rows as PSDetail[];

export function generateStaticParams() {
  return rows.map((r) => ({ id: r.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ps = rows.find((r) => r.id === id);
  return {
    title: ps ? `${ps.id} · ${ps.title}` : "SIH 2026 Problem Statement",
    description: ps?.description.slice(0, 160) || "SIH 2026 problem statement detail",
  };
}

export default async function PSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ps = rows.find((r) => r.id === id);
  if (!ps) notFound();
  const isYt = ps.youtube.startsWith("http");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 font-sans">
      <p className="text-sm text-zinc-500">
        <Link className="underline" href="/">← all problem statements</Link>
      </p>
      <h1 className="mt-2 text-2xl font-bold">
        <span className="mr-2 font-mono text-lg text-zinc-500">{ps.id}</span>
        {ps.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">{ps.cat}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">{ps.theme}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
          Ideas <LiveCount id={ps.id} count={ps.count} cap={ps.cap} />
        </span>
      </div>
      <dl className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        <div><dt className="inline font-medium text-zinc-900 dark:text-zinc-200">Organization: </dt><dd className="inline">{ps.org}</dd></div>
        <div><dt className="inline font-medium text-zinc-900 dark:text-zinc-200">Department: </dt><dd className="inline">{ps.dept}</dd></div>
        <div><dt className="inline font-medium text-zinc-900 dark:text-zinc-200">Deadline: </dt><dd className="inline">{ps.deadline}</dd></div>
      </dl>
      {ps.descriptionHtml ? (
        <div
          className="mt-6 space-y-3 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: ps.descriptionHtml }}
        />
      ) : null}
      <div className="mt-6 space-y-1 text-sm">
        {isYt && <p><a className="underline" href={ps.youtube} target="_blank" rel="noopener noreferrer">YouTube briefing ↗</a></p>}
        {ps.dataset && <p className="text-zinc-600 dark:text-zinc-400">Dataset: {ps.dataset}</p>}
        {ps.datasetLinks.map((l) => (
          <p key={l}><a className="break-all underline" href={l} target="_blank" rel="noopener noreferrer">{l} ↗</a></p>
        ))}
      </div>
      <footer className="mt-10 text-xs text-zinc-500">
        Snapshot from repo · live count overlays on load ·{" "}
        <a className="underline" href="https://sih.gov.in/sih2026PS" target="_blank" rel="noopener noreferrer">sih.gov.in ↗</a>
      </footer>
    </main>
  );
}
