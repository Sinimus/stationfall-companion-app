# TASK 016: Search synonyms

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Make search find the right entry from a non-matching synonym (e.g. "zbraň" → Hasák/Pistole) via a
curated query-time synonym expansion, and index glossary aliases into search.

## Design note

Synonyms are handled **only in search** (query expansion), NOT via the `aliases` data field — because
`aliases` also drive inline linkify, and a broad/ambiguous synonym like "zbraň" must not linkify every
occurrence to one weapon. So: no data/schema/linkify changes; the synonym map lives in `search.ts`.

## 2. Files

- Modify: `src/lib/search.ts` (index glossary `aliases`; add synonym query expansion)
- Modify: `src/lib/__tests__/search.test.ts`

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests** — append to `src/lib/__tests__/search.test.ts`:
  ```ts
  it("finds weapons via the synonym 'zbraň'", () => {
    const ids = search("zbraň").map((r) => r.id);
    expect(ids).toContain("hasak");
    expect(ids).toContain("pistole");
  });

  it("finds a term via its alias", () => {
    expect(search("HP").some((r) => r.type === "glossary" && r.id === "hracova-postava")).toBe(true);
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — "zbraň" does not return both weapons (no synonym expansion).

- [ ] **Index glossary aliases** in `src/lib/search.ts` — change the glossary indexing line so the
  body includes aliases:
  ```ts
  for (const g of glossary) add("glossary", g.id, g.nameCs, `${g.text} ${(g.aliases ?? []).join(" ")}`);
  ```

- [ ] **Add synonym expansion** in `src/lib/search.ts` — above the `search` function:
  ```ts
  // Curated query-time synonyms (search-only; does NOT affect inline linkify).
  const SYNONYMS: Record<string, string> = {
    zbraň: "hasák pistole",
    zbrane: "hasák pistole",
    zbraně: "hasák pistole",
    weapon: "hasák pistole",
    gun: "pistole",
    kamera: "kamery",
    přilba: "helma",
    helmet: "helma",
    bomba: "ohnivá bomba",
  };

  function expandQuery(query: string): string {
    const extra = query
      .toLowerCase()
      .split(/\s+/)
      .map((token) => SYNONYMS[token])
      .filter((value): value is string => value !== undefined);
    return extra.length > 0 ? `${query} ${extra.join(" ")}` : query;
  }
  ```
  And use it in `search`:
  ```ts
  export function search(query: string): SearchResult[] {
    if (query.trim() === "") return [];
    return index
      .search(expandQuery(query))
      .map((r) => meta.get(String(r.id)))
      .filter((x): x is SearchResult => x !== undefined);
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — "zbraň" returns hasak + pistole; "HP" finds the glossary term; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `as string`, `@ts-ignore`. Do not modify data / `src/data/*` /
  `linkify.ts` / `term-sheet*.tsx`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (synonym "zbraň" → Hasák + Pistole; alias "HP" → glossary term; all prior).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Synonyms affect only search (no linkify/data change).
4. Report written to `docs/blueprint/reports/report_016.md`.
