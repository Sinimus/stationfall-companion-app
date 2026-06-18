# Report: 018 — Clickable Project X names + entity bottom-sheet + search

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Linked Project X names in text and generalized the bottom-sheet to show a glossary term OR a Project X
card. `LinkRef` gains a `"projectx"` kind; the sheet context gains `openProject`; `RuleText` renders
projectx refs as buttons opening the card; Project X search results open the same sheet.

## TDD Cycle
- **RED** — Appended a linkify projectx test + a rule-text "open Project X" test; ran `pnpm test`.
  Confirmed FAIL: projectx not matched / `getByRole("button", name "Entropický přízrak")` not found.
  Existing 41 tests passed.
- **GREEN (1st attempt)** — Implemented all pieces; two existing suites then failed as a direct
  consequence of projectx names now being linkified (see Test Updates below).
- **GREEN (fix)** — Made those two assertions resilient; `pnpm test` PASS (43/43).

## Files Modified
- `src/lib/lookups.ts` — added `projectById` Map (+ `projectsX`/`ProjectX` import).
- `src/lib/linkify.ts` — `LinkRef.kind` union extended to `"glossary" | "character" | "projectx"`;
  `entries` now also maps each `projectsX` `nameCs` to a projectx ref (longest-first sort unchanged).
- `src/components/term-sheet-context.tsx` — `TermSheetCtx` gains `openProject: (id) => void`.
- `src/components/term-sheet.tsx` — replaced with the entity sheet: state is a discriminated
  `OpenRef` (`glossary` | `projectx`); resolves the term OR the project; renders the matching body
  (term: category chip + `RuleText` definition + related/seeAlso/ruleRefs; project: `RuleText` text +
  optional `RuleText` trigger); subtitle is `KIND_LABEL[term.kind]` or "Projekt X". Glossary branch is
  byte-for-byte the prior behavior.
- `src/components/rule-text.tsx` — destructures `openProject`; projectx ref → `<button onClick={openProject}>`.
- `src/app/hledat/page.tsx` — glossary + projectx results are buttons (`openTerm`/`openProject`); the
  rest remain `<Link href={hrefFor(r)}>` (character/flow/faq). `hrefFor` unchanged (projectx no longer
  reaches it).
- `src/lib/__tests__/linkify.test.ts` + `src/components/__tests__/rule-text.test.tsx` — new tests.

## Test Updates (necessary consequences of projectx linkify)
Two pre-existing assertions broke because projectx names are now linkified, splitting exact-text
matches — fixed per "keep all tests passing; don't weaken data":
- `character-dossier.test.tsx`: agentka's edge case "Mina nereaguje na **Entropický přízrak** ani …"
  now splits "Entropický přízrak" into a projectx button. Changed `getByText(/Mina nereaguje na
  Entropický přízrak/)` → `getByText(/Mina nereaguje na/)` (resilient unique prefix; still verifies the
  edge case renders).
- `project-x-list.test.tsx`: every Project X card self-references its own name in its text, so
  `getByText("Bojové hejno")` / `"Paprsek smrti"` found multiple (summary + self-ref button). Changed
  to `getAllByText(...).length > 0`.

## Pre-Implementation Verification
- entropicky-prizrak → "Entropický přízrak"; appears in agentka's edge case (drove the dossier update).
- No projectx name collides with any glossary name/alias or character name; no duplicate lowercased
  projectx names → `refByLowerName` stays unambiguous.
- antihmota's definition contains no projectx name → the term-sheet `getByText(/odjistí/)` assertion is
  unaffected (glossary behavior unchanged).

## Test Results
- `pnpm test` — PASS: 16 files, 43 tests. projectx linkify; Project X opens in the sheet; glossary sheet
  behavior (open, seeAlso, definition-linkify, close) unchanged; search + hledat green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (projectx linkify; Project X opens in sheet; glossary unchanged; search; all prior). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes. ✓
3. Project X names in text are tappable and open the card in the bottom-sheet — verified in the built
   `out/postavy/agentka.html` ("Entropický přízrak" renders as a linkified button); Project X search
   results open the same sheet (`hledat` projectx → `openProject`). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`as string`/`@ts-ignore` — used `kind: "projectx" as const` for narrowing and a
  discriminated `OpenRef` union. ✓
- No edits to `src/data/*` (git status: only lookups/linkify/term-sheet*/rule-text/hledat + 4 test files). ✓
- Glossary sheet behavior unchanged (the glossary branch is the prior code; term-sheet tests green). ✓
- All existing tests pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Project X name matching is exact whole-phrase (no Czech declension) — e.g. "Chapadlovitou
  nestvůrnost" (declined, in agentka's edge case) does not linkify the "Chapadlovitá obludnost" card.
  Consistent with the glossary/character behavior.
- The entity sheet now switches on a discriminated union; adding more entity kinds (e.g. flows) would
  extend `OpenRef` + the `LinkRef` union — the type system guides that.
