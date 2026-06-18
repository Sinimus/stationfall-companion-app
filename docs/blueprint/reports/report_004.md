# Report: 004 — Characters list + filters

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Rendered the 28 characters on `/postavy` as a tappable, cs-sorted grid with client-side single-select
filters by character type and by ability category (tap-again clears). Added the character-type label
helpers alongside the existing category system.

## TDD Cycle
- **RED** — Wrote `character-list.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/character-list"`. Existing 11 tests still passed.
- **GREEN** — Extended categories, implemented the list, wired the page. `pnpm test` PASS (14/14).

## Files Modified
- `src/lib/categories.ts` — appended `CharacterType` (derived from `Character["type"]`),
  `CHARACTER_TYPES` (`as const satisfies`), `TYPE_LABEL`. Existing exports unchanged.
- `src/components/character-list.tsx` — new (`"use client"`); two single-select toggle filter rows
  (type + category), filtered grid of Links to `/postavy/[id]`. Category buttons use the `bg-cat-*`
  tokens; `hasCategory` checks `abilities` + `revealAbilities`.
- `src/app/postavy/page.tsx` — replaced stub; cs-sorted (`localeCompare(b, "cs")`), `sr-only` heading,
  renders `<CharacterList/>`.
- `src/components/__tests__/character-list.test.tsx` — new (3 tests).

## Pre-Implementation Data Verification
Confirmed the test's data assertions against the (authoritative) data before implementing:
- Robots = 5 (Drony, Medik, Právník, Společník, Strážce) → matches `toHaveLength(5)`.
- `Strážce` is a robot (present after filter); `Agentka` is `clovek` (absent after filter).
- Konspirační characters = 19 (satisfies `0 < n < 28`). No data edits were needed.

## Test Results
- `pnpm test` — PASS: 5 files, 14 tests (data 7 + categories 2 + bottom-nav 2 + character-list 3).
  Robot filter → 5, Strážce present, Agentka absent, category filter narrows then resets to 28.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: `/postavy` exports (plus the other 4 app routes), all `○ Static`.

## Acceptance Criteria Verified
1. `pnpm test` passes (count, type filter, category filter + reset). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/postavy`. ✓
3. Grid is cs-sorted (verified in `out/postavy.html`: `Cizinec` precedes `Černá pasažérka` — Č sorts
   after C, confirming Czech collation, not ASCII); filters are single-select toggle (tap toggles on,
   tap again clears) — both verified by unit tests. ✓
4. Report written. ✓

## Constraints Verified
- No `any`, `as any`, `@ts-ignore`; no edits to `src/data/*` (git status shows no changes there). ✓
- All existing tests still pass. ✓
- Links target `/postavy/[id]` (detail route lands in task 005; may 404 until then — acceptable per task). ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- `/postavy/[id]` detail routes don't exist yet (task 005) — clicking a card navigates to a 404 in the
  current static export. Expected and out of scope for this task.
