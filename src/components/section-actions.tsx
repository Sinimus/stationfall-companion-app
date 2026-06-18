"use client";

import { useTermSheet } from "@/components/term-sheet";
import { glossaryById } from "@/lib/lookups";

export function SectionActions({ actionIds }: { actionIds: string[] }) {
  const { openTerm } = useTermSheet();
  if (actionIds.length === 0) {
    return <p className="text-sm text-zinc-500">Žádná zvláštní akce sekce.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {actionIds.map((id) => {
        const term = glossaryById.get(id);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => openTerm(id)}
              className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm dark:border-zinc-800"
            >
              {term !== undefined ? term.nameCs : id}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
