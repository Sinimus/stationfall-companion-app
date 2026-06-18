"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { search, type SearchResult } from "@/lib/search";
import { useTermSheet } from "@/components/term-sheet";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  character: "Postava",
  glossary: "Pojem",
  faq: "Q&A",
  flow: "Průvodce",
  projectx: "Projekt X",
  section: "Sekce",
};

function hrefFor(r: SearchResult): string {
  if (r.type === "character") return `/postavy/${r.id}`;
  if (r.type === "flow") return `/pruvodci/${r.id}`;
  if (r.type === "faq") return `/pruvodci#faq-${r.id}`;
  if (r.type === "section") return `/sekce/${r.id}`;
  return "/pruvodci";
}

export default function HledatPage() {
  const { openTerm, openProject } = useTermSheet();
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);

  return (
    <main className="space-y-3 p-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hledat postavy, pojmy, Q&A…"
        aria-label="Hledat"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {query.trim() !== "" && results.length === 0 ? (
        <p className="text-sm text-zinc-500">Nic nenalezeno.</p>
      ) : null}

      <ul className="space-y-2">
        {results.map((r) => {
          const label = (
            <>
              <span className="font-medium">{r.title}</span>
              <span className="ml-2 text-xs text-zinc-500">{TYPE_LABEL[r.type]}</span>
            </>
          );
          return (
            <li key={`${r.type}:${r.id}`}>
              {r.type === "glossary" || r.type === "projectx" ? (
                <button
                  type="button"
                  onClick={() =>
                    r.type === "glossary" ? openTerm(r.id) : openProject(r.id)
                  }
                  className="block w-full rounded-lg border border-zinc-200 p-3 text-left active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                >
                  {label}
                </button>
              ) : (
                <Link
                  href={hrefFor(r)}
                  className="block rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
