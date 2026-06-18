# Report: 003 — Navigable app shell, category color system & UI test infra

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Built the navigable mobile shell: bottom tab nav across four sections, the official 6-category color
token system (derived types + `@theme` tokens), Czech document metadata, four route stubs, a
client-side default-tab redirect, and component test infrastructure (jsdom + Testing Library).

## TDD Cycle
- **RED** — Wrote `categories.test.ts` + `bottom-nav.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/lib/categories"` and `"@/components/bottom-nav"`. Existing 7 data tests
  still passed. (A second transient failure surfaced in GREEN — see Deviation 1.)
- **GREEN** — Implemented helpers, tokens, nav, layout, routes, redirect. `pnpm test` PASS (11/11).

## Files Modified
- `vitest.config.ts` — switched to `environment: "jsdom"` + `setupFiles: ["./vitest.setup.ts"]`.
- `vitest.setup.ts` — new; jest-dom matchers + explicit `afterEach(cleanup)` (see Deviation 1).
- `src/lib/categories.ts` — new; `AbilityCategory` type derived from `Character["abilities"][number]["category"]`
  (no new source of truth), `ABILITY_CATEGORIES` (`as const satisfies`), `CATEGORY_LABEL`, `CATEGORY_BG_CLASS`.
- `src/app/globals.css` — appended `@theme { --color-cat-* }` block (6 official key colors).
- `src/components/bottom-nav.tsx` — new (`"use client"`); 4 Link destinations, `aria-current="page"`
  on active route (prefix match), lucide-react icons, zinc palette.
- `src/app/layout.tsx` — replaced; Czech metadata (`title`/`description`), `<html lang="cs">`,
  `<BottomNav/>`, `pb-16` nav clearance, `min-h-dvh`. Removed Geist fonts.
- `src/app/page.tsx` — replaced with client `router.replace("/postavy")` redirect (static-export safe).
- `src/app/{postavy,glosar,pruvodci,hledat}/page.tsx` — new route stubs (CZ headings).
- `src/lib/__tests__/categories.test.ts` + `src/components/__tests__/bottom-nav.test.tsx` — new.
- `package.json` / `pnpm-lock.yaml` — +`lucide-react`; dev +`jsdom`, `@testing-library/{react,dom,jest-dom,user-event}`.

## Environment Used
- pnpm 10.28.2. New deps: lucide-react 1.20.0; dev: @testing-library/react 16.3.2,
  @testing-library/dom 10.4.1, @testing-library/jest-dom 6.9.1, @testing-library/user-event 14.6.1, jsdom 29.1.1.

## Deviations from Task Spec
1. **`vitest.setup.ts` adds explicit `afterEach(cleanup)`** beyond the task's single jest-dom import.
   The task sets `globals: false`, under which Testing Library's auto-cleanup (which registers via the
   global `afterEach`) never fires, so the two `render(<BottomNav/>)` calls in `bottom-nav.test.tsx`
   accumulated in the DOM and the 2nd test threw `getMultipleElementsFoundError`. The fix imports
   `afterEach` explicitly from vitest (still respecting `globals: false`) and calls `cleanup()` — the
   documented approach for non-globals configs. Necessary to satisfy acceptance criterion 1.

## Test Results
- `pnpm test` — PASS: 4 files, 11 tests (data 7 + categories 2 + bottom-nav 2).
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: static export, 5 app routes + `/_not-found` (all `○ Static`).

## Acceptance Criteria Verified
1. `pnpm test` passes (data + categories + bottom-nav). ✓
2. `pnpm build` exports `/`, `/postavy`, `/glosar`, `/pruvodci`, `/hledat`; `pnpm lint` zero warnings. ✓
3. Bottom nav on every page (verified in all 5 `out/*.html`), active tab marked
   `aria-current="page"` (each route correctly marks its own tab), `<html lang="cs">` on all pages. ✓
4. `bg-cat-*` resolve from `@theme` tokens — confirmed in built CSS: all 6 `--color-cat-*` tokens
   emitted and `.bg-cat-pohybove{background-color:var(--color-cat-pohybove)}` etc. present. ✓

## Constraints Verified
- No `any`, `as any`, `@ts-ignore`; pnpm only; shadcn/ui NOT installed. ✓
- Data files, `schema.ts`, `schemas.ts`, `src/data/index.ts` untouched (git status shows no changes
  under `src/data/`). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints on test runs (carried from task 001; task spec mandates the plugin).
- `src/app/layout.tsx` no longer wires Geist fonts; `globals.css` `@theme inline` still references
  `--font-geist-sans/mono` (now undefined) via `--font-sans/mono`. Harmless (body falls back to Arial
  per the existing `font-family` rule) but the dangling font tokens could be cleaned up when a real
  type system is introduced.
- Route stubs are headings only; feature content lands in subsequent tasks.
