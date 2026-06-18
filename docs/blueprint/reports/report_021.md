# Report: 021 — Sections data layer (schema + validation + integrity)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Wired the Architect-authored `src/data/sections.json` (41 station sections) into the typed, Zod-validated
data layer: added the `Section` interface + zone/gravity unions to `schema.ts`, the `sectionSchema` to
`schemas.ts`, and the `sections`/`sectionIds` exports (Zod `.parse` at load) to `index.ts`, plus smoke
+ integrity tests.

## TDD Cycle
- **RED** — Added a sections count assertion to `data.smoke.test.ts` (direct JSON import) and two
  section invariants to `data.integrity.test.ts` (imports `sections` from `@/data`); ran `pnpm test`.
  Confirmed FAIL: `sections` not exported from `@/data` (`sections is not iterable`). Smoke passed (41
  via direct JSON import). Existing 45 tests passed.
- **GREEN** — Added schema + Zod schema + index exports. `pnpm test` PASS (47/47).

## Files Modified
- `src/data/schema.ts` — added `SectionZone` / `SectionGravity` unions, the `Section` interface
  (matching the data), and `sections: Section[]` to `StationfallData`.
- `src/data/schemas.ts` — added `sectionZone`, `sectionGravity`, `sectionSchema` (`.strict()`), and the
  `Section = z.infer<...>` type.
- `src/data/index.ts` — imports `sections.json` + `sectionSchema`; `export const sections =
  z.array(sectionSchema).parse(sectionsJson)`; `export const sectionIds = new Set(...)`; re-exports `Section`.
- `src/data/__tests__/data.smoke.test.ts` — `import sections from "@/data/sections.json"` + count 41.
- `src/data/__tests__/data.integrity.test.ts` — added `sections` to the `@/data` import; two tests
  (unique ids / 41 entries; every action resolves to a glossary id).

## Minor Deviation from Task Spec
- The integrity test imports only `sections` (not `sectionIds`) from `@/data`. The task suggested
  importing `sectionIds` alongside, but the assertions don't use it and an unused import would fail the
  lint gate (acceptance criterion 2). `glossaryIds` was already imported, so only `sections` was added.
  `sectionIds` is still exported from `@/data` for consumers.

## Pre-Implementation Data Verification
Confirmed the real `sections.json` against the `.strict()` schema before running (avoids a parse-time
surprise):
- 41 entries; observed keys (id/nameCs/zone/gravity/actions on all 41; notes 30, powered 3,
  consolePanel 2, lit 7, escapePod 6) exactly match the schema — no extra/unknown keys.
- zone ⊆ {horni-prstenec, dolni-prstenec, centralni-osa, unikovy-modul, specialni};
  gravity ⊆ {gravitace, nulova}.
- All 33 section `actions` resolve to glossary ids (integrity check passes). No schema edits needed.

## Test Results
- `pnpm test` — PASS: 16 files, 47 tests. sections count 41; unique ids; every action resolves to a
  glossary id; all prior suites green (the Zod `.parse` succeeded at load).
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (sections in smoke + integrity; actions resolve; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports. ✓
3. `sections` + `sectionIds` exported from `@/data`, Zod-validated at load (`.parse`, fail-fast). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; used Zod `.parse` (fail-fast, not softened to `safeParse`). ✓
- `src/data/sections.json` and all other data files NOT edited (git status: only `schema.ts`,
  `schemas.ts`, `index.ts`, and the two test files). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- `schema.ts` ↔ `schemas.ts` remain a dual source of truth for `Section` (and now include the optional
  flags lit/powered/consolePanel/escapePod); kept in sync manually, as with the other types.
- The Section `actions` are validated as resolvable glossary ids but not yet surfaced in any UI
  (the sections pillar UI is a separate task).
