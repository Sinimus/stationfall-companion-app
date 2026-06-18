# TASK 010: Global fuzzy search

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

A client-side fuzzy search on `/hledat` across characters, glossary terms, Q&A and flows; results
route to the right destination (character/flow page, glossary sheet, Q&A page).

## 2. Files

- Add dependency: `minisearch`
- Create: `src/lib/search.ts` + `src/lib/__tests__/search.test.ts`
- Modify: `src/app/hledat/page.tsx`
- Create: `src/app/hledat/__tests__/page.test.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Install MiniSearch**
  Run: `pnpm add minisearch`

- [ ] **Write failing tests** — `src/lib/__tests__/search.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { search } from "@/lib/search";

  describe("search", () => {
    it("returns nothing for an empty query", () => {
      expect(search("")).toEqual([]);
    });
    it("finds a character by ability keyword", () => {
      expect(search("EMP").some((r) => r.type === "character" && r.id === "agentka")).toBe(true);
    });
    it("finds a glossary term", () => {
      expect(search("antihmota").some((r) => r.type === "glossary" && r.id === "antihmota")).toBe(true);
    });
    it("finds a Q&A entry", () => {
      expect(search("kamery").some((r) => r.type === "faq")).toBe(true);
    });
  });
  ```

  `src/app/hledat/__tests__/page.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { TermSheetProvider } from "@/components/term-sheet";
  import HledatPage from "@/app/hledat/page";

  describe("HledatPage", () => {
    it("shows matching results as the user types", async () => {
      const user = userEvent.setup();
      render(
        <TermSheetProvider>
          <HledatPage />
        </TermSheetProvider>,
      );
      await user.type(screen.getByRole("searchbox"), "Agentka");
      expect(screen.getByRole("link", { name: /Agentka/ })).toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/search` does not exist.

- [ ] **Implement `src/lib/search.ts`** (complete, no placeholders; no type assertions):
  ```ts
  import MiniSearch from "minisearch";
  import { characters, glossary, faq, flows } from "@/data";

  export type ResultType = "character" | "glossary" | "faq" | "flow";
  export type SearchResult = { type: ResultType; id: string; title: string };

  type Doc = { ref: string; title: string; body: string };

  const meta = new Map<string, SearchResult>();
  const docs: Doc[] = [];

  function add(type: ResultType, id: string, title: string, body: string): void {
    const ref = `${type}:${id}`;
    meta.set(ref, { type, id, title });
    docs.push({ ref, title, body });
  }

  for (const c of characters) {
    const body = [
      ...c.abilities.map((a) => `${a.name} ${a.text}`),
      ...c.revealAbilities.map((a) => `${a.name} ${a.text}`),
      ...c.edgeCases,
      ...c.tips,
      c.setup,
    ].join(" ");
    add("character", c.id, c.nameCs, body);
  }
  for (const g of glossary) add("glossary", g.id, g.nameCs, g.text);
  for (const f of faq) add("faq", f.id, f.question, `${f.answer} ${(f.tags ?? []).join(" ")}`);
  for (const fl of flows) {
    const body = `${fl.intro ?? ""} ${fl.steps.map((s) => `${s.title} ${s.body}`).join(" ")}`;
    add("flow", fl.id, fl.title, body);
  }

  const index = new MiniSearch<Doc>({
    idField: "ref",
    fields: ["title", "body"],
    searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
  });
  index.addAll(docs);

  export function search(query: string): SearchResult[] {
    if (query.trim() === "") return [];
    return index
      .search(query)
      .map((r) => meta.get(String(r.id)))
      .filter((x): x is SearchResult => x !== undefined);
  }
  ```

- [ ] **Implement `src/app/hledat/page.tsx`** (client; complete):
  ```tsx
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
  };

  function hrefFor(r: SearchResult): string {
    if (r.type === "character") return `/postavy/${r.id}`;
    if (r.type === "flow") return `/pruvodci/${r.id}`;
    return "/pruvodci";
  }

  export default function HledatPage() {
    const { openTerm } = useTermSheet();
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
                {r.type === "glossary" ? (
                  <button
                    type="button"
                    onClick={() => openTerm(r.id)}
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
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — search lib finds character/glossary/faq; page shows a result while typing.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; `/hledat` exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `as string`, `@ts-ignore`. (Use `String(r.id)` coercion + the
  `meta` map as shown — no assertions on MiniSearch results.)
- Do not modify data / `src/data/*` / `term-sheet.tsx`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (empty→none; finds character/glossary/faq; page renders a result while typing).
2. `pnpm lint` zero warnings; `pnpm build` exports `/hledat`.
3. Glossary results open the term sheet; character/flow results link to their pages; Q&A → `/pruvodci`.
4. Report written to `docs/blueprint/reports/report_010.md`.
