# Report: 022 — Sections UI (5th tab, list & detail)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added the 5th "Sekce" tab: `/sekce` lists the 41 sections grouped by zone with property filters
(temná/napájecí/ovládací panel), and `/sekce/[id]` (statically generated) shows a section's properties,
"what you can do here" (actions → glossary sheet), and notes.

## TDD Cycle
- **RED** — Wrote `section-list.test.tsx` + `section-detail.test.tsx` and updated `bottom-nav.test.tsx`
  to expect 5 destinations; ran `pnpm test`. Confirmed FAIL: `section-list`/`section-detail` unresolvable,
  bottom-nav had 4 links. Existing tests passed.
- **GREEN** — Implemented `sections.ts`, the 5th nav item, the three components, and both routes.
  `pnpm test` PASS (50/50).

## Files Modified
- `src/lib/sections.ts` — new; `sectionById` Map, `SectionZone` (derived), `ZONE_ORDER` (`as const satisfies`),
  `ZONE_LABEL`, `GRAVITY_LABEL`.
- `src/components/bottom-nav.tsx` — added the `/sekce` "Sekce" item (`MapIcon`), `grid-cols-4` → `grid-cols-5`.
- `src/components/section-list.tsx` — new (`"use client"`); multi-select property filters (lit→dark =
  `lit === false`, powered/consolePanel → `=== true`), zone-grouped cs-sorted Links.
- `src/components/section-actions.tsx` — new (`"use client"`); renders each action as a button that opens
  the glossary term sheet (`openTerm`), label from `glossaryById` (fallback to id); empty-state message.
- `src/components/section-detail.tsx` — new; header (zone · gravity · dark), property chips
  (powered/consolePanel/escapePod), `<SectionActions>` for `s.actions`, notes via `RuleText`.
- `src/app/sekce/page.tsx` + `src/app/sekce/[id]/page.tsx` — new; list page + SSG detail
  (`generateStaticParams` for 41 ids, async `params`, `notFound()` guard).
- `src/components/__tests__/bottom-nav.test.tsx` — "four destinations" → "five destinations".
- `src/components/__tests__/section-list.test.tsx` + `section-detail.test.tsx` — new.

## Pre-Implementation Data Verification
Confirmed the test assertions against the data before implementing:
- Exactly **7 sections have `lit === false`** → the "Temná" filter yields 7 (no section has `lit === true`,
  so dark = the 7 with explicit `false`).
- `bezpecnostni-stanice` exists (nameCs "Bezpečnostní stanice"); its actions include `vyroba`
  (glossary nameCs "Výroba") → the detail test's `getByRole("button", { name: "Výroba" })` holds.

## Test Results
- `pnpm test` — PASS: 18 files, 50 tests. section list (41 / dark 7), section detail actions, bottom-nav 5;
  all prior green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: exports `/sekce` + 41 `/sekce/<id>` pages (SSG).

## Acceptance Criteria Verified
1. `pnpm test` passes (section list + filter, section detail, bottom-nav 5, all prior). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/sekce` and 41 `/sekce/<id>` pages (41 detail files
   confirmed via `ls out/sekce/*.html`; list at `out/sekce.html`). ✓
3. Bottom nav has a "Sekce" tab (`href="/sekce"` present across pages); `/sekce` groups by all 5 zones
   with property filters; detail shows properties + glossary-linked actions (Výroba/Kamery/Rušičky for
   bezpecnostni-stanice) + notes. ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`. ✓
- No edits to `src/data/*` or `term-sheet*.tsx`
  (git status: only new `sections.ts`/section components/routes/tests + modified `bottom-nav.tsx` + its test). ✓
- All existing tests still pass (bottom-nav test updated to 5, per the task). ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The 5-tab nav is now denser (`grid-cols-5`); on very narrow viewports the labels could get tight — a
  future polish task could shorten labels or use icons-only at small widths.
- `SectionActions`/`SectionDetail` are not yet integrated into global search (search still returns the
  other entity kinds); indexing sections is a separate concern if desired.
