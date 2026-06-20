"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { FaqEntry } from "@/data";
import { characterIds } from "@/data";
import { useTermSheet } from "@/components/term-sheet";
import { RuleText } from "@/components/rule-text";
import { Prose } from "@/components/prose";
import { glossaryById, characterNameById } from "@/lib/lookups";

function matches(entry: FaqEntry, q: string): boolean {
  const needle = q.toLowerCase();
  if (entry.question.toLowerCase().includes(needle)) return true;
  return (entry.tags ?? []).some((t) => t.toLowerCase().includes(needle));
}

export function FaqList({ faq }: { faq: FaqEntry[] }) {
  const { openTerm } = useTermSheet();
  const [query, setQuery] = useState("");
  const visible = query.trim() === "" ? faq : faq.filter((e) => matches(e, query.trim()));

  useEffect(() => {
    function openFromHash() {
      const hash = window.location.hash;
      if (!hash.startsWith("#faq-")) return;
      const el = document.getElementById(hash.slice(1));
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        if (typeof el.scrollIntoView === "function") el.scrollIntoView();
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hledat v Q&A…"
        aria-label="Hledat v Q&A"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {visible.length === 0 ? (
        <p className="text-sm text-zinc-500">Nic nenalezeno.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((entry) => (
            <li key={entry.id}>
              <details
                id={`faq-${entry.id}`}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <summary className="cursor-pointer font-medium">{entry.question}</summary>
                <div className="mt-2 space-y-2">
                  <Prose>
                    <RuleText>{entry.answer}</RuleText>
                  </Prose>

                  {entry.seeAlso && entry.seeAlso.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.seeAlso.map((sid) => {
                        const term = glossaryById.get(sid);
                        if (term !== undefined) {
                          return (
                            <button
                              key={sid}
                              type="button"
                              onClick={() => openTerm(sid)}
                              className="text-xs underline"
                            >
                              {term.nameCs}
                            </button>
                          );
                        }
                        if (characterIds.has(sid)) {
                          return (
                            <Link key={sid} href={`/postavy/${sid}`} className="text-xs underline">
                              {characterNameById.get(sid) ?? sid}
                            </Link>
                          );
                        }
                        return (
                          <Link key={sid} href={`/pruvodci/${sid}`} className="text-xs underline">
                            {sid}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}

                  {entry.ruleRefs && entry.ruleRefs.length > 0 ? (
                    <p className="text-xs text-zinc-500">Pravidla: {entry.ruleRefs.join(", ")}</p>
                  ) : null}

                  {entry.source ? (
                    <p className="text-xs text-zinc-400">Zdroj: {entry.source}</p>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
