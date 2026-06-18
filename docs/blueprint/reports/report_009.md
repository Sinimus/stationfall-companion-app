# Report: 009 — Causality Q&A (FAQ) list

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added the 31 causality Q&A to `/pruvodci` as an expandable, filterable list. Each answer is
keyword-cross-linked via `RuleText` and shows seeAlso links (glossary → term sheet, character →
`/postavy/<id>`, flow → `/pruvodci/<id>`), rule refs, and source provenance.

## TDD Cycle
- **RED** — Wrote `faq-list.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/faq-list"`. Existing 24 tests still passed.
- **GREEN** — Implemented `FaqList` + added the Q&A section. `pnpm test` PASS (26/26).

## Files Modified
- `src/components/faq-list.tsx` — new (`"use client"`); client-side `matches()` filter over question
  text + tags, `<details>`/`<summary>` per entry, answer via `RuleText`, seeAlso resolver (glossary
  button → `openTerm`, character/flow → `Link`), rule refs + source lines, empty-state message.
- `src/app/pruvodci/page.tsx` — added the "Otázky & kauzality" section after "Postupy"; imports `faq`.
- `src/components/__tests__/faq-list.test.tsx` — new (2 tests).

## Pre-Implementation Data Verification
Confirmed the fixture assertions before implementing:
- "Jak anihilovat antihmotu?" and "Jak zapnout/vypnout kamery?" both exist;
- "kamery" matches the camera question (question text + `kamery` tag) and does NOT match the antihmotu
  question (no `kamery` in question or tags) → filter behavior is correct. No data edits needed.
- All 31 entries carry `ruleRefs` and `source` (verified at build output: 31 "Pravidla:", 31 "Zdroj:").

## Test Results
- `pnpm test` — PASS: 11 files, 26 tests (prior 24 + faq-list 2). Questions render; "kamery" narrows.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: `/pruvodci` exports with the Q&A list (plus all prior routes).

## Acceptance Criteria Verified
1. `pnpm test` passes (questions render; query filter by question + tags). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` including the Q&A list. ✓
3. Each answer routes through `RuleText` — `out/pruvodci.html` has 78 linkified keyword buttons across
   the answers; seeAlso resolver present (~120 seeAlso buttons/links); rule refs (31) + source (31) shown. ✓
4. Report written. ✓

## Note for Reviewer
The Q&A search input is rendered in the static HTML with `placeholder="Hledat v Q&amp;A…"` — the `&`
is HTML-escaped (per spec), so naive substring checks for "Hledat v Q&A" miss it; the input is present
and functional (the unit test asserts it via `getByRole("searchbox")`).

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no edits to `src/data/*` or `term-sheet.tsx`
  (git status: only new `faq-list` + test, and the modified `/pruvodci` page). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The search is a plain client-side `includes` over question + tags (no fuzzy/diacritic-insensitive
  matching) — adequate for 31 entries; a search index could be added in task 010 (the `/hledat` pillar).
- seeAlso flow targets fall back to the raw id as the link label (no flow-title lookup) — consistent
  with the term-sheet behavior; could show a friendly title later.
