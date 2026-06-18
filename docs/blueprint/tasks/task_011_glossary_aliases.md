# TASK 011: Glossary term aliases (abbreviations HP/CP/BP)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Make abbreviations (HP, CP, BP) inline-linkable: add an optional `aliases` field to glossary terms,
populate it for the three "postava" terms, and teach the linkifier to match aliases — so standalone
"HP"/"CP"/"BP" in any text opens the right glossary term.

> This is an authorized **data** change (the three additions below are specified exactly). It must be
> atomic with the schema change, or Zod `.strict()` will reject the new `aliases` key at load.

## 2. Files

- Modify: `src/data/schema.ts` (add `aliases?` to `GlossaryTerm`)
- Modify: `src/data/schemas.ts` (add `aliases` to `glossaryTermSchema`)
- Modify: `src/data/glossary.json` (add `aliases` to 3 entries — exact edits below)
- Modify: `src/lib/linkify.ts` (index aliases too)
- Modify: `src/lib/__tests__/linkify.test.ts` (add alias test)

## 3. Implementation Steps (TDD)

- [ ] **Add failing test** — append to `src/lib/__tests__/linkify.test.ts`:
  ```ts
  it("links an abbreviation via alias (HP)", () => {
    const parts = splitGlossaryText("Moje HP je v bezpečí.");
    const linked = parts.find((p) => p.id !== undefined);
    expect(linked?.text).toBe("HP");
    expect(linked?.id).toBe("hracova-postava");
  });

  it("links the BP abbreviation", () => {
    const parts = splitGlossaryText("Agentka je vaše BP.");
    expect(parts.some((p) => p.id === "bonusova-postava" && p.text === "BP")).toBe(true);
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — "HP"/"BP" are not matched (aliases not indexed yet).

- [ ] **Add `aliases` to the schema** — in `src/data/schema.ts`, `GlossaryTerm` interface, add after `nameCs`:
  ```ts
  /** Alternativní tvary pro vyhledávání a inline linkování (např. zkratky "HP"). */
  aliases?: string[];
  ```

- [ ] **Add `aliases` to the Zod schema** — in `src/data/schemas.ts`, `glossaryTermSchema`, add:
  ```ts
  aliases: z.array(z.string()).optional(),
  ```

- [ ] **Add aliases to the data** — in `src/data/glossary.json`, add an `"aliases"` key to exactly
  these three objects (match by `id`):
  - `"id": "hracova-postava"` → add `"aliases": ["HP"]`
  - `"id": "cizi-postava"` → add `"aliases": ["CP"]`
  - `"id": "bonusova-postava"` → add `"aliases": ["BP"]`
  Do not change anything else in the file.

- [ ] **Index aliases in `src/lib/linkify.ts`** — change the `entries` construction so each term
  contributes its `nameCs` AND each alias (same `id`):
  ```ts
  const entries = glossary
    .flatMap((g) => [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ id: g.id, name })))
    .sort((a, b) => b.name.length - a.name.length);
  ```
  (The rest — `idByLowerName`, `escaped`, `pattern`, `splitGlossaryText` — stays the same; it already
  derives from `entries`.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — HP/BP alias tests green; all prior suites (incl. data integrity) still pass.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build still exports; a built `/postavy/agentka` page now renders
  "HP"/"BP" as linkified buttons (Agentka's agenda mentions HP; bonus text mentions BP).

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`.
- The ONLY data edits allowed are the three `aliases` additions above. Do not alter any other
  glossary text, ids, or `term-sheet.tsx`.
- Aliases are matched with the same Unicode word boundaries, so "HP" won't match inside "PHP" etc.

## 5. Acceptance Criteria

1. `pnpm test` passes (HP + BP alias links; all prior tests green).
2. `pnpm lint` zero warnings; `pnpm build` still exports all routes.
3. Standalone HP/CP/BP in any rendered text are tappable and open their glossary term.
4. Report written to `docs/blueprint/reports/report_011.md`.
