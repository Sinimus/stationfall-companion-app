"use client";

import { useState } from "react";
import type { GlossaryTerm } from "@/data";
import { useTermSheet } from "@/components/term-sheet";
import { KIND_ORDER, KIND_LABEL, type GlossaryKind } from "@/lib/lookups";

export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const { openTerm } = useTermSheet();
  const [kind, setKind] = useState<GlossaryKind | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Filtr podle druhu">
        {KIND_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(kind === k ? null : k)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {KIND_ORDER.filter((k) => kind === null || k === kind).map((k) => {
        const group = terms
          .filter((t) => t.kind === k)
          .sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
        if (group.length === 0) return null;
        return (
          <section key={k} aria-label={KIND_LABEL[k]}>
            <h2 className="mb-1 text-sm font-semibold text-zinc-500">{KIND_LABEL[k]}</h2>
            <ul className="flex flex-wrap gap-2">
              {group.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openTerm(t.id)}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                  >
                    {t.nameCs}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
