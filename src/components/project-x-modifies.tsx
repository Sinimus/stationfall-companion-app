"use client";

import Link from "next/link";
import type { ProjectX } from "@/data";
import { useTermSheet } from "@/components/term-sheet-context";
import { glossaryById, characterNameById } from "@/lib/lookups";

export function ProjectXModifies({ project }: { project: ProjectX }) {
  const { openTerm } = useTermSheet();
  if (!project.modifies || project.modifies.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-zinc-500">Modifikuje</p>
      <ul className="space-y-0.5 text-sm">
        {project.modifies.map((m, i) => (
          <li key={i}>
            {m.targetKind === "glossary" ? (
              <button type="button" onClick={() => openTerm(m.targetId)} className="underline">
                {glossaryById.get(m.targetId)?.nameCs ?? m.targetId}
              </button>
            ) : (
              <Link href={`/postavy/${m.targetId}`} className="underline">
                {characterNameById.get(m.targetId) ?? m.targetId}
              </Link>
            )}{" "}
            — {m.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
