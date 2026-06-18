# Report: 007 — Inline keyword cross-linking

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added automatic inline cross-linking: a `splitGlossaryText` matcher that splits free text against the
glossary (exact whole-phrase, longest-first, Unicode-aware `\p{L}` boundaries) and a `<RuleText>`
client component that renders matches as buttons calling `useTermSheet().openTerm(id)`. Wrapped the
dossier's free-text fields so any glossary keyword there is tappable and opens its bottom-sheet.

## TDD Cycle
- **RED** — Wrote `linkify.test.ts` + `rule-text.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/lib/linkify"` and `"@/components/rule-text"`. Existing 19 tests passed.
- **GREEN (1st attempt)** — Implemented all three pieces; the existing dossier tests then failed with
  `useTermSheet must be used within TermSheetProvider` (dossier now renders `RuleText` → needs context).
- **GREEN (fix)** — Wrapped the dossier test renders in `<TermSheetProvider>` (the task-anticipated
  "fix the rendering wrap; do not weaken data" case). `pnpm test` now PASS (23/23).

## Files Modified
- `src/lib/linkify.ts` — new; precomputes a single alternation regex (longest-first, `(?<![\p{L}])…(?![\p{L}])`,
  `giu`), `idByLowerName` lookup, `splitGlossaryText` → `TextPart[]`.
- `src/components/rule-text.tsx` — new (`"use client"`); splits `children`, renders glossary matches as
  buttons (`openTerm(id)`), plain text as `Fragment`s. Used `const id = part.id` narrowing (no `as string`).
- `src/components/character-dossier.tsx` — wrapped free-text fields in `<RuleText>`: ability `text`,
  agenda `ag.text`, `bonusPoints`, each edge-case, each tip, `setup`. Ability NAMES, agenda title,
  headings left plain. Added the import.
- `src/components/__tests__/character-dossier.test.tsx` — wrapped both renders in `<TermSheetProvider>`
  (required now that the dossier renders `RuleText`). Assertions unchanged.
- `src/lib/__tests__/linkify.test.ts` + `src/components/__tests__/rule-text.test.tsx` — new.

## Pre-Implementation Data Verification
- `"data"` is a glossary term (id `data-pojem`) → the "database" boundary test is meaningful; no
  duplicate lowercased names exist (so `idByLowerName` is unambiguous).
- The asserted edge case "Mina nereaguje na Entropický přízrak…" contains **no** glossary term → it
  stays a single fragment after wrapping (verified), so `getByText(/Mina…/)` still matches.
- The asserted ability names "Důstojník" / "Granáty s nervovým plynem" do **not** recur inside agentka's
  wrapped free-text → no `getByText` multiple-match collision. No data edits were needed.

## Test Results
- `pnpm test` — PASS: 9 files, 23 tests. linkify (exact match, no in-word match, round-trip),
  RuleText opens the sheet, all prior suites green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: 36 pages; all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (linkify units, RuleText opens sheet, all prior suites). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes. ✓
3. Built `/postavy/<id>` pages render keyword spans as buttons — `out/postavy/agentka.html` has 17
   linkified buttons (e.g. `blackout`, `vyřazená`, `zámky`, `data`, `tajemství X`, `nestvůra`); tapping
   opens the term sheet at runtime (covered by the RuleText + term-sheet tests). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; used `const id = part.id` narrowing instead of `as string`. ✓
- No edits to `src/data/*` or `term-sheet.tsx` (circular import avoided — `RuleText` not used inside it). ✓
- All existing tests pass (dossier test updated to provide the now-required context; data/weakening avoided). ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Inflected forms (e.g. "do Okolního vesmíru") are a known limitation of exact whole-phrase matching —
  a future enhancement can add per-term match aliases to the data (per design note).
- `RuleText` keys list items by index (`key={i}`); stable for static text, but a content key would be
  preferable if parts gain identities.
- The single alternation regex is rebuilt from all 109 names at module load (once, cached) — fine for
  this corpus; if the glossary grows large, a trie-based matcher would scale better.
