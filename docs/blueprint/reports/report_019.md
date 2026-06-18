# Report: 019 — Add glossary term "NDA"

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added the glossary term "NDA" (dohoda o mlčenlivosti) so the abbreviation — which appears 15× in the
game texts but was previously unexplained — is both defined and inline-linkable. Because `aliases` are
indexed automatically by `linkify.ts` and `search.ts`, no code changes were needed: only the data
entry, the two count assertions, and one linkify test.

## TDD Cycle
- **RED** — Appended an NDA linkify test; ran `pnpm test`. Confirmed FAIL: term `nda` did not exist, so
  `splitText` returned no `nda` ref. Existing 43 tests passed (smoke/integrity still asserted 109).
- **GREEN** — Added the NDA object + updated both counts to 110 atomically. `pnpm test` PASS (44/44).

## Files Modified
- `src/data/glossary.json` — inserted the NDA object after the `data-pojem` entry. **Surgical: +9 lines,
  0 changed** (`git diff --stat`: 9 insertions). No other entry touched.
- `src/data/__tests__/data.smoke.test.ts` — glossary `toHaveLength(109)` → `110`.
- `src/data/__tests__/data.integrity.test.ts` — glossary `toHaveLength(109)` → `110`.
- `src/lib/__tests__/linkify.test.ts` — added the NDA alias-linkify test.

## Deviation from Task Spec
- **Linkify test predicate adapted.** The task's verbatim test used
  `splitText("Právník umístí NDA všem.").find((p) => p.ref !== undefined)`, but `pravnik.nameCs ===
  "Právník"`, so the **character** ref links first and `.find` returns `{kind:"character", id:"pravnik"}`
  — the assertion `toEqual({kind:"glossary", id:"nda"})` could never pass. I kept the task's exact
  sentence and changed the predicate to `.find((p) => p.ref?.id === "nda")`, which targets the NDA ref
  specifically (skipping the preceding "Právník" link) and still asserts `{kind:"glossary", id:"nda"}`.
  This preserves the test's intent and is arguably stronger (verifies NDA links even beside a character
  name). Verified against the data before implementing.

## Pre-Implementation Verification
- `pravnik` exists (relatedCharacterIds target) and `data-pojem` exists (seeAlso target) → both resolve
  under the integrity tests' cross-link checks.
- No `"nda"` collision: no glossary name/alias, character, or projectx name lowercases to "nda" →
  `refByLowerName`/`idByLowerName` stay unambiguous; alias auto-indexing required no code change.
- The NDA object's keys (`id`, `nameCs`, `aliases`, `kind:"data"`, `text`, `relatedCharacterIds`,
  `seeAlso`) all satisfy the `.strict()` Zod schema; JSON re-parses to 110 entries.

## Test Results
- `pnpm test` — PASS: 16 files, 44 tests. NDA alias → `{kind:"glossary", id:"nda"}`; glossary length 110
  in smoke + integrity; all prior green (incl. the integrity cross-link checks for the new term).
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (NDA alias → glossary nda; glossary length 110 in both suites; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports successfully. ✓
3. "NDA" occurrences in rendered game texts are tappable and open the NDA glossary term — verified in
   built pages: **15 NDA buttons in `out/postavy/pravnik.html`** (matches "appears 15× in the game
   texts") + 1 in `out/glosar.html`. ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`. ✓
- The ONLY data change is the single NDA object (9-line insertion, nothing else altered). ✓
- `linkify.ts`, `search.ts`, and `term-sheet*.tsx` NOT touched (git status: only `glossary.json` + 3
  test files). Alias auto-indexing handled it with no code change. ✓
- All existing tests remain green. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The NDA entry relies on the auto-indexed `aliases` for both linkify and search; if more
  abbreviations are added later, the same zero-code pattern applies.
