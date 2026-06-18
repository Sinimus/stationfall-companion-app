# Report: 012 — Project X cards UI + search indexing

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Surfaced the 8 Project X cards: an expandable "Projekty X" section on `/pruvodci` (text + trigger via
`RuleText`), and a new `projectx` result type in global search (`/hledat`).

## TDD Cycle
- **RED** — Wrote `project-x-list.test.tsx` + appended a Project-X search test; ran `pnpm test`.
  Confirmed FAIL: `@/components/project-x-list` unresolvable, and `search("hejno")` returned no
  `projectx` result. Existing 33 tests passed.
- **GREEN** — Implemented the list, the section, the search type, and the page label. `pnpm test` PASS (35/35).

## Files Modified
- `src/components/project-x-list.tsx` — new; `<details>`/`<summary>` per card, text + optional trigger
  both routed through `RuleText`.
- `src/app/pruvodci/page.tsx` — added the "Projekty X" section after Q&A; imports `projectsX`.
- `src/lib/search.ts` — added `"projectx"` to `ResultType`, imported `projectsX`, indexed all 8 cards
  (`add("projectx", p.id, p.nameCs, \`${p.text} ${p.trigger ?? ""}\`)`).
- `src/app/hledat/page.tsx` — added `projectx: "Projekt X"` to `TYPE_LABEL`. (`hrefFor` unchanged —
  its `/pruvodci` fallback already routes projectx, same as faq.)
- `src/components/__tests__/project-x-list.test.tsx` + `src/lib/__tests__/search.test.ts` — new/updated.

## Type-safety note
`ResultType` is consumed as `Record<SearchResult["type"], string>` in `hledat/page.tsx`, so adding
`"projectx"` to the union and the `TYPE_LABEL` entry landed together (the build's `tsc` would otherwise
error on the missing Record key).

## Pre-Implementation Data Verification
Confirmed the fixture assertions before implementing:
- 8 cards; "Bojové hejno" and "Paprsek smrti" present (render test);
- "hejno" is a token of "Bojové hejno" → MiniSearch prefix match → `search("hejno")` finds a projectx
  result. No data edits needed.

## Test Results
- `pnpm test` — PASS: 14 files, 35 tests (prior 33 + project-x-list 1 + search 1). Names render;
  search finds a Project X; all prior suites green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: `/pruvodci` exports including the 8 Project X cards (plus all prior routes).

## Acceptance Criteria Verified
1. `pnpm test` passes (Project X names render; search finds a Project X; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` with the 8 Project X cards. ✓
3. Project X text/trigger route through `RuleText` — `out/pruvodci.html` shows the cards and 114
   linkified keyword buttons across the page (incl. project text/trigger); global search returns
   Project X results (search test + index). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`as string`/`@ts-ignore`; no edits to `src/data/*` or `term-sheet.tsx`
  (git status: only new `project-x-list` + test, and modified `search.ts`, `hledat/page.tsx`,
  `pruvodci/page.tsx`, `search.test.ts`). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Project X search results (like faq) link to `/pruvodci` rather than a deep anchor into the Projekty X
  section — consistent with the faq behavior; an in-page anchor could be added later.
- The search index now covers 180 docs (28 + 109 + 31 + 4 + 8); still small and built once at load.
