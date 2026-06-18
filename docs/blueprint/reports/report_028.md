# Report: 028 — Wire harvested FAQ (More FAQ IMHO) + section cross-links

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
The Architect harvested 18 new Q&A from the BGG "More FAQ IMHO" thread into `src/data/faq.json` (now 49
total, each new entry carrying `sourceUrl`/`harvestedAt`). Updated the count assertions and extended the
integrity `seeAlso` check so FAQ entries may reference **section** ids (the new entries link to sections
like `biolaborator`, `fyzikalni-laborator`). No UI changes — the FAQ list/search and the contextual
accordion consume the collection generically.

## Starting State
`faq.json` already had 49 entries (authored by the Architect; not edited by me), with 18 carrying the
new provenance fields. The suite was already red at task start:
- smoke + integrity asserted `faq` length 31 (now 49);
- the `seeAlso` integrity check rejected the new section targets (`biolaborator`,
  `fyzikalni-laborator`, `okolni-vesmir`) because `linkTargets` lacked section ids.

## TDD Cycle
- **RED** — Ran `pnpm test`; confirmed FAIL: 3 failures (faq count ×2 + seeAlso rejecting section targets).
  Other 60 tests passed (the new entries parse fine — `sourceUrl`/`harvestedAt` are optional in the
  schema since task 027).
- **GREEN** — Updated both counts `31 → 49` and added `sectionIds` to the integrity `linkTargets`.
  `pnpm test` PASS (63/63).

## Files Modified
- `src/data/__tests__/data.smoke.test.ts` — `faq` `toHaveLength(31)` → `49`.
- `src/data/__tests__/data.integrity.test.ts` — `faq` `toHaveLength(31)` → `49`; imported `sectionIds`
  from `@/data`; `linkTargets` now `[...characterIds, ...glossaryIds, ...flowIds, ...sectionIds]`.
- (`src/data/faq.json` and `src/data/_sources/processed-threads.json` show as modified in git status, but
  those are the Architect's pre-existing harvest — I did NOT edit them.)

## Verification
- All `seeAlso` targets (glossary + faq) resolve once `sectionIds` are included — no orphans (the 3
  section targets `biolaborator`, `fyzikalni-laborator`, `okolni-vesmir` all exist).
- `pnpm test` — PASS: 22 files, 63 tests.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (faq count 49; seeAlso incl. section targets resolve; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports. ✓
3. The new Q&A are searchable and surface in the contextual "Výjimky (N)" accordion on their linked
   entities — covered generically (`search.ts` indexes all faq; `faq.ts` reverse-indexes every
   `seeAlso`). Verified in built output: the accordion is now present on `out/sekce/biolaborator.html`
   and `out/sekce/fyzikalni-laborator.html` (sections newly referenced by the harvested Q&A). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no `src/data/*` data files edited by me
  (git status: only the two test files changed by me; `faq.json`/`processed-threads.json` are the
  Architect's harvest). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The `linkTargets` set now spans characters + glossary + flows + sections — the canonical set of
  cross-linkable ids; any future entity kind added to `seeAlso` would need to be included here too.
