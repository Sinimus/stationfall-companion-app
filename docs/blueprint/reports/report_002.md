# Report: 002 — Typed, Zod-validated data layer + integrity tests

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-17

## Summary
Added a Zod-validated data layer (`src/data/schemas.ts` + `src/data/index.ts`) that parses each
bundled JSON at load via `.parse` and exposes strongly-typed arrays + id maps, plus an integrity
test suite porting the extraction-time validation (unique ids, categories, resolvable cross-links).

## TDD Cycle
- **RED** — Wrote `src/data/__tests__/data.integrity.test.ts`, ran `pnpm test`. Confirmed FAIL:
  `Cannot find package '@/data'` (index did not exist). Smoke test still passed (2/2).
- **GREEN** — Implemented `schemas.ts` + `index.ts`. `pnpm test` now PASSES (7/7).

## Files Modified
- `src/data/schemas.ts` — new; Zod schemas mirroring `schema.ts` (`.strict()` objects, enums, optional
  fields). Exports `characterSchema`, `glossaryTermSchema`, `causalFlowSchema`, `projectXSchema`,
  `faqEntrySchema` + inferred types.
- `src/data/index.ts` — new; single typed entry point. Imports JSON + schemas, runs
  `z.array(<schema>).parse(<json>)` for each collection, exports validated arrays and
  `characterIds`/`glossaryIds`/`flowIds` Sets. Re-exports the inferred types.
- `src/data/__tests__/data.integrity.test.ts` — new; 5 invariant tests (counts, unique ids,
  schopnost→category, relatedCharacterIds resolve, seeAlso resolve).
- `package.json` / `pnpm-lock.yaml` — added `zod ^4.4.3`.

## Environment Used
- Package manager: pnpm 10.28.2
- New dependency: zod 4.4.3

## Pre-Implementation Data Verification
Before writing production code, verified the real data against the `.strict()` schemas to confirm no
schema/data mismatch (the task mandates fixing the schema — not the data — if `.parse` rejects):
- All top-level + nested keys (incl. `flow.steps[].branches` = `{label, body}`) match the schemas;
  no extra/unknown keys anywhere → `.strict()` accepts all rows.
- All enum values valid: `type` ⊆ {clovek, robot, data, predmet}; `kind` ⊆ 9 kinds; `category` ⊆ 6 colors.
- `influenceLimit` all ints; `agendas[].points` all ints; ability/agenda field types correct.
- No schema edits were required — the task schemas match the data exactly.

## Test Results
- `pnpm test` — PASS: 2 files, 7 tests (smoke 2 + integrity 5). Counts 28/109/4/8/31 ✓.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: static `out/index.html` exported; TypeScript check clean.

## Constraints Verified
- JSON data files and `schema.ts` NOT modified (git status shows only new files + package.json/lock).
- No `any`, `as any`, `@ts-ignore`. Used `z.array(...).parse(...)` (throws on invalid) — not softened to `safeParse`.
- `src/data/index.ts` is the single typed entry point (Zod-validated at load).
- Existing `data.smoke.test.ts` left untouched and still passing.

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints on test run (carried over from task 001;
  task spec mandates the plugin, so kept as-is).
- `schemas.ts` and `schema.ts` are two sources of truth for the same shapes. They are currently in
  sync, but have no automated check linking them. A future task could derive `schema.ts` types from
  the Zod schemas (or vice-versa) to eliminate the manual sync risk.
- Zod installed at v4 (latest); `schemas.ts` uses only stable cross-version APIs (`z.enum`,
  `.strict()`, `.optional()`, `z.infer`), so no v3→v4 migration concerns here.
