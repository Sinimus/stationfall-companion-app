# Report: 025 — Project X cross-link warnings (UI)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Surfaced the static Project X cross-links: a ⚠ warning on modified glossary terms (in the bottom-sheet)
and characters (in the dossier) that opens the Project X card, plus a "Modifikuje" forward list on each
Project X card.

## TDD Cycle
- **RED** — Wrote `project-x-warning.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/project-x-warning"`. Existing 57 tests passed.
- **GREEN** — Implemented the two components and wired them into term-sheet / dossier / project-x-list.
  `pnpm test` PASS (59/59).

## Files Modified
- `src/components/project-x-warning.tsx` — new (`"use client"`); `useTermSheet` from the **context module**
  (avoids the term-sheet cycle); reads `projectsModifying(targetId)`; renders an amber ⚠ block per
  modifier with a button (`openProject(projectX.id)`) + note; renders nothing when unmodified.
- `src/components/project-x-modifies.tsx` — new (`"use client"`); forward "Modifikuje" list — glossary
  target → button (`openTerm`), character target → `<Link href="/postavy/<id>">` — each with its note;
  nothing when empty.
- `src/components/term-sheet.tsx` — renders `<ProjectXWarning targetId={term.id} />` in the glossary
  branch (after `ruleRefs`, inside the fragment) + import.
- `src/components/character-dossier.tsx` — renders `<ProjectXWarning targetId={c.id} />` right after
  `</header>` + import.
- `src/components/project-x-list.tsx` — renders `<ProjectXModifies project={p} />` after the trigger
  paragraph inside each `<details>` (map var is `p`) + import.
- `src/components/__tests__/project-x-warning.test.tsx` — new (2 tests).

## Pre-Implementation Data Verification
Confirmed the test fixtures against the reverse index (task 024): `podezrely` is modified by Bojové
hejno (+ Paprsek smrti); `konspirator` is unmodified (renders nothing); `botanik` is modified by
Masožravý bioexperiment (the built-page check).

## Test Results
- `pnpm test` — PASS: 20 files, 59 tests. Warning shows for `podezrely` and the button opens the
  Bojové hejno card; nothing for `konspirator`; all prior green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (warning shows + opens card; empty for unmodified; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes. ✓
3. Modified glossary terms (sheet) and characters (dossier) show the ⚠ Project X warning; Project X
   cards show a "Modifikuje" list — verified in built output: `out/postavy/botanik.html` has the ⚠ block
   referencing "Masožravý bioexperiment"; `out/pruvodci.html` has 7 "Modifikuje" lists (7 of 8 projects
   carry `modifies`), with targets like "Podezřelý". ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`. ✓
- No edits to `src/data/*` (git status: only new warning/modifies components + their test, and modified
  term-sheet/dossier/project-x-list). ✓
- `ProjectXWarning` / `ProjectXModifies` import `useTermSheet` from `@/components/term-sheet-context`
  (not `@/components/term-sheet`) — no circular import. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The warning/forward-list reuse the entity sheet (`openProject`/`openTerm`) and Next `Link`s; the
  glossary warning and the project "Modifikuje" list are now bidirectional cross-links between
  Project X cards and their targets.
- The ⚠ block uses a fixed amber palette inline (not a shared token) — fine for one-off emphasis; could
  be tokenized if more warning variants are added.
