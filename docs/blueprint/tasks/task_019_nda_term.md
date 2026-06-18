# TASK 019: Add glossary term "NDA"

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Add the glossary term "NDA" so that the abbreviation — which appears 15× in the game texts but is
currently unexplained — becomes both defined and inline-linkable. Because `aliases` are already
indexed automatically by `linkify.ts` and `search.ts`, **no changes to those files are needed**;
only the data entry, the count assertions in the two smoke/integrity test files, and one new
linkify test are required.

## 2. Files

- Modify: `src/data/glossary.json` (add 1 term — exact object specified below)
- Modify: `src/data/__tests__/data.smoke.test.ts` (glossary length 109 → 110)
- Modify: `src/data/__tests__/data.integrity.test.ts` (glossary length 109 → 110)
- Modify: `src/lib/__tests__/linkify.test.ts` (add one alias-linkify test for "NDA")

## 3. Implementation Steps (TDD)

- [ ] **Add failing test** — append to `src/lib/__tests__/linkify.test.ts`:
  ```ts
  it("links the NDA abbreviation to its glossary term", () => {
    const linked = splitText("Právník umístí NDA všem.").find((p) => p.ref !== undefined);
    expect(linked?.ref).toEqual({ kind: "glossary", id: "nda" });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test` (from `/Users/editor/Development/Personal/stationfall-companion-app`)
  Expected: FAIL — term `nda` does not exist yet, so `splitText` returns no linked part.
  Note: the smoke and integrity tests will also fail once the count is updated, so fix data first.

- [ ] **Add the NDA term to `src/data/glossary.json`** — insert the following object anywhere in
  the top-level array (e.g. after the `"data-pojem"` entry). Copy it verbatim:
  ```json
  {
    "id": "nda",
    "nameCs": "NDA",
    "aliases": ["NDA"],
    "kind": "data",
    "text": "NDA (dohoda o mlčenlivosti) je typ dat. Právník ji schopností Obsílka vyrobí do vlastnictví všech kolokovaných lidí a robotů. Je důležitá pro úkoly Právníka (jeho schopnosti po odhalení s NDA pracují).",
    "relatedCharacterIds": ["pravnik"],
    "seeAlso": ["data-pojem"]
  }
  ```

- [ ] **Update glossary count in `src/data/__tests__/data.smoke.test.ts`**
  Change:
  ```ts
  expect(glossary).toHaveLength(109)
  ```
  to:
  ```ts
  expect(glossary).toHaveLength(110)
  ```

- [ ] **Update glossary count in `src/data/__tests__/data.integrity.test.ts`**
  Change:
  ```ts
  expect(glossary).toHaveLength(109)
  ```
  to:
  ```ts
  expect(glossary).toHaveLength(110)
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — NDA alias test green; smoke + integrity counts green; all prior tests still pass.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports all routes; "NDA" in any rendered text is tappable
  and opens the glossary term.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`.
- The ONLY authorized data change is the single NDA object above. Do not edit any other glossary
  entry, character, or data file.
- Do NOT touch `linkify.ts`, `search.ts`, or any `term-sheet*.tsx` — alias indexing is already
  automatic and requires no code changes.
- All existing tests must remain green.

## 5. Acceptance Criteria

1. `pnpm test` passes: NDA alias linkifies to `{ kind: "glossary", id: "nda" }`; glossary length
   is 110 in both smoke and integrity suites; all prior tests remain green.
2. `pnpm lint` zero warnings; `pnpm build` exports successfully.
3. "NDA" occurrences in rendered game texts are tappable and open the NDA glossary term.
4. Report written to `docs/blueprint/reports/report_019.md`.
