# TASK 028: Wire harvested FAQ (More FAQ IMHO) + allow section cross-links

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

The Architect harvested 18 new Q&A from the BGG "More FAQ IMHO" thread into `src/data/faq.json`
(now 49, each with `sourceUrl`/`harvestedAt`). Update the count assertions and extend the integrity
`seeAlso` check so faq entries may reference **section** ids (the new entries link to sections like
`biolaborator`, `fyzikalni-laborator`).

> `src/data/faq.json` and `src/data/_sources/processed-threads.json` are already updated — DO NOT edit them.

## 2. Files

- Modify: `src/data/__tests__/data.smoke.test.ts` (faq 31 → 49)
- Modify: `src/data/__tests__/data.integrity.test.ts` (faq 31 → 49; add `sectionIds` to seeAlso targets)

## 3. Implementation Steps (TDD)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — faq length now 49 (asserted 31), and the seeAlso check rejects the new section
  references (e.g. `biolaborator`) because the link-target set lacks section ids.

- [ ] **Update faq count** in both test files: `expect(faq).toHaveLength(31)` → `49`.

- [ ] **Allow section ids as seeAlso targets** in `src/data/__tests__/data.integrity.test.ts`:
  - Import `sectionIds` from `@/data` (extend the existing import).
  - Add it to the set used to validate `seeAlso`. The current line is roughly:
    ```ts
    const linkTargets = new Set<string>([...characterIds, ...glossaryIds, ...flowIds]);
    ```
    Change it to include sections:
    ```ts
    const linkTargets = new Set<string>([...characterIds, ...glossaryIds, ...flowIds, ...sectionIds]);
    ```
    (If the test builds the target set differently, just ensure `sectionIds` are included for the
    glossary+faq `seeAlso` resolution check.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — faq count 49; all `seeAlso` (glossary + faq) resolve (incl. section targets); all
  prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. The new Q&A are searchable and surface in the
  contextual "Výjimky (N)" accordion on their linked entities (e.g. the Bio Lab section, Právník).

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit `src/data/*` data files.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (faq count 49; seeAlso incl. section targets resolve; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Report written to `docs/blueprint/reports/report_028.md`.
