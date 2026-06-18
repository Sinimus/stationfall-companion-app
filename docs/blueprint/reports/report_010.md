# Report: 010 — Global fuzzy search

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added a client-side fuzzy search on `/hledat` across characters, glossary terms, Q&A and flows using
MiniSearch. Results route to the right destination: character/flow → their page, glossary → term sheet,
Q&A → `/pruvodci`.

## TDD Cycle
- **RED** — Wrote `search.test.ts` + `page.test.tsx`; ran `pnpm test`. Confirmed FAIL: `@/lib/search`
  unresolvable, and the `/hledat` stub had no `searchbox` (`Unable to find an accessible element with
  the role "searchbox"`). Existing 26 tests passed.
- **GREEN** — Implemented the search index + client page. `pnpm test` PASS (31/31).

## Files Modified
- `src/lib/search.ts` — new; builds a MiniSearch index over 172 docs (28 characters incl. ability
  text/edge cases/tips/setup, 109 glossary terms, 31 Q&A incl. answer+tags, 4 flows incl. step text).
  `search()` returns `SearchResult[]` (`type`/`id`/`title`); empty query → `[]`. `String(r.id)`
  coercion + `meta` map + type predicate (no assertions on MiniSearch output).
- `src/app/hledat/page.tsx` — replaced the task-003 stub with a `"use client"` page: search input
  (`useMemo` results), result list where glossary renders a button (`openTerm`) and the rest render
  `Link`s (`hrefFor`: character→`/postavy/<id>`, flow→`/pruvodci/<id>`, faq→`/pruvodci`), empty-state hint.
- `src/lib/__tests__/search.test.ts` + `src/app/hledat/__tests__/page.test.tsx` — new (4 + 1 tests).
- `package.json` / `pnpm-lock.yaml` — +`minisearch 7.2.0`.

## Pre-Implementation Data Verification
Confirmed the fixture assertions before implementing:
- agentka has ability "EMP" (name in the indexed body) → `search("EMP")` finds character agentka;
- antihmota glossary term present → `search("antihmota")`;
- faq `kamery-zapnout-vypnout` matches "kamery" (question + tag) → `search("kamery")` finds a faq result.
No data edits needed. 172 docs indexed (28 + 109 + 31 + 4).

## Test Results
- `pnpm test` — PASS: 13 files, 31 tests (prior 26 + search 4 + page 1). Empty→none; finds
  character/glossary/faq; page shows a result while typing "Agentka".
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: `/hledat` exports (plus all prior routes); the co-located
  `src/app/hledat/__tests__/` dir does not create a route.

## Acceptance Criteria Verified
1. `pnpm test` passes (empty→none; finds character/glossary/faq; page renders a result while typing). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/hledat`. ✓
3. Routing: glossary results open the term sheet (button → `openTerm`); character → `/postavy/<id>`,
   flow → `/pruvodci/<id>`, Q&A → `/pruvodci` (covered by `hrefFor` + page test). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`as string`/`@ts-ignore` — used `String(r.id)` + the `meta` map + a type predicate
  for the MiniSearch result mapping. ✓
- No edits to `src/data/*` or `term-sheet.tsx` (git status: only new search lib + hledat page + tests,
  and package.json/lock for minisearch). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The search index is built once at module load (172 docs, small) — fine for this corpus; if it grows
  significantly, building it lazily or off the main bundle could be considered.
- Q&A results link to `/pruvodci` (the Q&A list) rather than deep-linking the specific question — the
  `/pruvodci` Q&A list has its own filter, so this is a reasonable landing; a per-question anchor could
  be added later.
- No diacritic-insensitive normalization beyond MiniSearch's default tokenizer; Czech diacritics in
  queries must currently match the indexed text (acceptable for MVP).
