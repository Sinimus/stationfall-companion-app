# Report: 006 — Glossary browser + term bottom-sheet

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added a `/glosar` browser that lists the 109 glossary terms grouped by kind (with a kind filter),
plus a dependency-light reusable bottom-sheet (`role="dialog"`/`aria-modal`) that shows a term's
definition, "Objevuje se u" (related characters), "Související" (seeAlso) and rule references. The
sheet is driven by a `TermSheetProvider` context exposing `useTermSheet().openTerm(id)` for reuse.

## TDD Cycle
- **RED** — Wrote `term-sheet.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/term-sheet"`. Existing 16 tests still passed.
- **GREEN** — Implemented lookups, term-sheet, browser, layout wrap, glosar page. `pnpm test` PASS (19/19).

## Files Modified
- `src/lib/lookups.ts` — new; `glossaryById`/`characterNameById` Maps, `GlossaryKind` (derived),
  `KIND_ORDER` (`as const satisfies`), `KIND_LABEL`.
- `src/components/term-sheet.tsx` — new (`"use client"`); `TermSheetProvider` + `useTermSheet` hook,
  state-driven overlay (`role="presentation"` backdrop + `role="dialog"` panel), Escape-to-close,
  category chip, related-character Links (`/postavy/<id>`), seeAlso buttons (glossary) / Links
  (character → `/postavy/<id>`, flow/other → `/pruvodci/<id>`), rule refs.
- `src/components/glossary-browser.tsx` — new (`"use client"`); kind filter (single-select toggle) +
  grouped, cs-sorted term buttons that call `openTerm(id)`.
- `src/app/layout.tsx` — wrapped `{children}` in `<TermSheetProvider>` (nav kept outside provider).
- `src/app/glosar/page.tsx` — replaced stub; `sr-only` heading + `<GlossaryBrowser terms={glossary}/>`.
- `src/components/__tests__/term-sheet.test.tsx` — new (3 tests).

## Design decisions (per task spec)
- React-state overlay, **not** shadcn/ui and **not** native `<dialog>` — fully jsdom-testable and
  avoids a shadcn/`@theme` clash. Backdrop click closes; inner panel `stopPropagation`; Escape closes.

## Pre-Implementation Data Verification
Confirmed the `antihmota` fixture assertions before implementing:
- nameCs "Antihmota"; text contains "odjistí" (matches `/odjistí/`);
- seeAlso includes "evakuace", which is a glossary term (nameCs "Evakuace") → renders as an in-sheet button.
All hold — no data edits needed.

## Test Results
- `pnpm test` — PASS: 7 files, 19 tests (data 7 + categories 2 + bottom-nav 2 + character-list 3 +
  dossier 2 + term-sheet 3). Open term, follow seeAlso (Antihmota → Evakuace), close via "Zavřít".
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export, `/glosar` included (36 pages total).

## Acceptance Criteria Verified
1. `pnpm test` passes (open term, seeAlso navigation, close). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/glosar`. ✓
3. `/glosar` lists terms grouped by all 9 kinds with a kind filter (verified 9 `aria-label` groups in
   `out/glosar.html`); tapping a term opens the bottom-sheet; seeAlso glossary links switch the sheet;
   related characters link to `/postavy/<id>` (22 terms carry `relatedCharacterIds`). ✓
4. `useTermSheet().openTerm(id)` exported for reuse (task 007 inline links). ✓
5. Report written. ✓

## Constraints Verified
- No `any`, `as any`, `@ts-ignore`; shadcn/ui NOT installed; no edits to `src/data/*`
  (git status shows only new lib/components + modified layout/glosar page). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The bottom-sheet is unmounted when closed (no focus-trap / scroll-lock). Acceptable for MVP; a full
  focus-trap + body-scroll-lock could be added in a polish task. Escape + backdrop-click + Zavřít
  button provide the close affordances; the dialog is keyboard-reachable via those.
- seeAlso targets that are neither glossary nor character fall back to `/pruvodci/<id>` (flow ids) and
  render the raw id as the label — fine while flows are id-keyed, but could show a friendly title once
  flow titles are looked up.
