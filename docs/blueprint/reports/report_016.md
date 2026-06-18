# Report: 016 — Search synonyms

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Made search find entries from non-matching synonyms (e.g. "zbraň" → Hasák + Pistole) via a curated
query-time synonym expansion, and indexed glossary `aliases` into the search index. Synonyms live
**only in search** (no data/schema/linkify changes) so broad/ambiguous synonyms don't pollute inline
linkify.

## TDD Cycle
- **RED** — Appended a synonym test + an alias test to `search.test.ts`; ran `pnpm test`. Confirmed
  FAIL: "zbraň" returned no weapons (no synonym expansion). (The alias test already passed because
  the title "Hráčova postava (HP)" contains the "HP" token.) Existing 38 tests passed.
- **GREEN** — Indexed aliases + added `SYNONYMS`/`expandQuery`. `pnpm test` PASS (40/40).

## Files Modified
- `src/lib/search.ts`:
  - Glossary indexing now appends aliases to the body:
    `add("glossary", g.id, g.nameCs, \`${g.text} ${(g.aliases ?? []).join(" ")}\`)`.
  - Added a curated `SYNONYMS` map (zbraň/zbrane/zbraně/weapon → hasák pistole, gun → pistole,
    kamera → kamery, přilba/helmet → helma, bomba → ohnivá bomba) and `expandQuery(query)` which
    lowercases/splits the query, appends each token's synonym phrase, and is used by `search()`.
- `src/lib/__tests__/search.test.ts` — added synonym + alias tests.

## Pre-Implementation Verification
Confirmed the synonym/alias targets resolve to real glossary terms before implementing:
- hasak → "Hasák", pistole → "Pistole" (the "zbraň" → "hasák pistole" expansion);
- hracova-postava carries alias "HP"; ohniva-bomba → "Ohnivá bomba", helma → "Helma", kamery term
  exists — all synonym targets are valid.

## Test Results
- `pnpm test` — PASS: 16 files, 40 tests (prior 38 + 2). "zbraň" → ids include `hasak` + `pistole`;
  "HP" → glossary `hracova-postava`.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (synonym "zbraň" → Hasák + Pistole; alias "HP" → glossary term; all prior). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports. ✓
3. Synonyms affect only search — only `search.ts` + `search.test.ts` changed; no edits to
   `src/data/*`, `linkify.ts`, or `term-sheet*.tsx` (verified via git status). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`as string`/`@ts-ignore` — `expandQuery` uses `String(r.id)` is unchanged; the
  synonym filter uses a type predicate `(value): value is string => value !== undefined`. ✓
- No data / `src/data/*` / `linkify.ts` / `term-sheet*.tsx` modified. ✓
- All existing tests still pass. ✓

## Design note (per task spec)
Synonyms are deliberately query-time-only: the `aliases` field also drives inline linkify (task 011),
and a broad synonym like "zbraň" must not linkify every occurrence to a single weapon. Keeping the
synonym map in `search.ts` (not the data) preserves that separation.

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The `SYNONYMS` map is hand-curated and Czech-diacritic-sensitive (separate keys for zbrane/zbraně);
  a normalized/accent-insensitive lookup could reduce key proliferation if the list grows.
- `expandQuery` uses `SYNONYMS[token]` direct lookup (exact token); multi-word synonym keys are not
  supported — adequate for the current curated set.
