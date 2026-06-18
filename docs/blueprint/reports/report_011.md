# Report: 011 — Glossary term aliases (abbreviations HP/CP/BP)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Made the abbreviations HP/CP/BP inline-linkable by adding an optional `aliases` field to glossary
terms (schema + Zod), populating it on the three "postava" terms, and teaching the linkifier to index
aliases — so standalone "HP"/"CP"/"BP" in any text open the right glossary term.

## TDD Cycle
- **RED** — Appended 2 alias tests to `linkify.test.ts`; ran `pnpm test`. Confirmed FAIL: "HP"/"BP"
  not matched (`expected undefined to be 'HP'`). Existing 31 tests passed.
- **GREEN (atomic)** — Landed schema + Zod schema + data + linkify together (required: Zod `.strict()`
  would reject the new `aliases` key at load if the schema change were missing). `pnpm test` PASS (33/33).

## Files Modified (authorized data + schema change)
- `src/data/schema.ts` — added `aliases?: string[]` to `GlossaryTerm` (after `nameCs`).
- `src/data/schemas.ts` — added `aliases: z.array(z.string()).optional()` to `glossaryTermSchema`.
- `src/data/glossary.json` — added `"aliases": ["HP"]` / `["CP"]` / `["BP"]` to exactly the three
  entries (`hracova-postava`, `cizi-postava`, `bonusova-postava`). **Surgical diff — nothing else
  changed** (verified via `git diff`: only 3 added lines).
- `src/lib/linkify.ts` — `entries` now `flatMap`s each term's `nameCs` + its `aliases` (same `id`),
  then sorts longest-first. The `idByLowerName`/`escaped`/`pattern`/`splitGlossaryText` logic is
  unchanged (it already derives from `entries`).
- `src/lib/__tests__/linkify.test.ts` — added HP + BP alias tests.

## Pre-Implementation Verification
- The 3 target entries exist (nameCs already contain "(HP)/(CP)/(BP)"); none had `aliases`.
- No collision: no existing term name lowercases to hp/cp/bp (so `idByLowerName` stays unambiguous).
- Word-boundary safety: "HP" won't match inside "PHP" etc. (same `(?<![\p{L}])…(?![\p{L}])` boundaries).
- Longest-first sort means the full phrase "Hráčova postava (HP)" still wins over the bare "HP" alias
  where both could start at the same position.

## Test Results
- `pnpm test` — PASS: 13 files, 33 tests (prior 31 + alias 2). HP→`hracova-postava`, BP→`bonusova-postava`;
  all prior suites (incl. data integrity, which re-parses the JSON with the new `aliases` key) green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (HP + BP alias links; all prior tests green). ✓
2. `pnpm lint` zero warnings; `pnpm build` still exports all routes. ✓
3. Standalone HP/CP/BP in rendered text are tappable and open their glossary term — `out/postavy/agentka.html`
   now renders HP (×2) and BP (×1) as linkified buttons (20 total linkified buttons, up from 17 in
   task 007); CP works via the same mechanism. ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`. ✓
- The ONLY glossary.json edits are the three `aliases` additions (verified diff); no other glossary
  text/ids changed; `term-sheet.tsx` not modified. ✓
- `src/data/*` modifications limited to the authorized `schema.ts`, `schemas.ts`, `glossary.json`
  (git status shows exactly those + `linkify.ts` + `linkify.test.ts`). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Aliases are matched case-insensitively (the regex is `giu`), so lowercase "hp"/"bp" would also link —
  acceptable/desirable; if case-abbreviation-only matching were ever needed, per-alias case flags would
  be required.
- The schema.ts ↔ schemas.ts dual-source-of-truth (noted in task 002) now also includes `aliases`;
  still kept in sync manually.
