# Report: 024 — Project X "modifies" (schema + reverse index)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Wired the authored `projectsX[].modifies` mapping (which rules/characters each Project X changes) into
the schema with Zod validation, and exposed a reverse index `projectsModifying(targetId)` (target id →
the Projects X that modify it, with note).

## Starting State (important)
The Architect had already added the `modifies` data to `src/data/projectsX.json` (7 of 8 entries, 12
modifier rows), but the `.strict()` `projectXSchema` (task 002) did not yet declare `modifies` — so the
suite was **already red** at the start of this task (`Unrecognized key: "modifies"` at the `@/data`
`.parse`, failing 13 files). This is the same atomic schema+data situation as task 011: the schema
change had to land to make the data parse again.

## TDD Cycle
- **RED** — Wrote `project-x.test.ts` (imports `@/lib/project-x` → missing) and appended the
  "every Project X 'modifies' target resolves" integrity test; ran `pnpm test`. Confirmed FAIL:
  `Unrecognized key: "modifies"` (parse) + `Failed to resolve import "@/lib/project-x"`.
- **GREEN** — Added `modifies` to the `ProjectX` interface + `projectXSchema` (fixed the parse) and
  created the reverse-index lib. `pnpm test` PASS (57/57).

## Files Modified
- `src/data/schema.ts` — `ProjectX` gains `modifies?: { targetId; targetKind: "glossary" | "character"; note: string }[]`.
- `src/data/schemas.ts` — `projectXSchema` gains `modifies` (optional array of a `.strict()`
  `{ targetId, targetKind: z.enum(["glossary","character"]), note }` object).
- `src/lib/project-x.ts` — new; `ProjectXModifier = { projectX: ProjectX; note: string }`; builds a
  `Map<targetId, ProjectXModifier[]>` once at load; `projectsModifying(targetId)` returns the list (or `[]`).
- `src/data/__tests__/data.integrity.test.ts` — appended the "every modifies target resolves" test
  (glossary target → `glossaryIds`, character target → `characterIds`); `projectsX`/`characterIds`
  were already imported.
- `src/lib/__tests__/project-x.test.ts` — new (2 tests).

## Pre-Implementation Data Verification
Confirmed the authored `modifies` against the `.strict()` schema before implementing (avoids a parse surprise):
- 7/8 projects carry `modifies`; 12 modifier rows total; each row has exactly `{ targetId, targetKind, note }`
  (no extra keys) → the nested `.strict()` accepts.
- `targetKind` ⊆ {glossary, character}; all 12 `targetId`s resolve (glossary→glossaryIds, character→characterIds).
- Fixtures: `bojove-hejno` modifies `podezrely` (glossary); `masozravy-bioexperiment` modifies `botanik`
  (character). No schema edits were needed beyond declaring the field.

## Test Results
- `pnpm test` — PASS: 19 files, 57 tests. Reverse index returns the right modifiers; unmodified target
  → `[]`; every modifies target resolves; all prior suites green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (reverse index + modifies targets resolve; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports. ✓
3. `projectsModifying(id)` exported; `ProjectX.modifies` typed + Zod-validated at load (`.parse`). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`. ✓
- No data files edited — `projectsX.json` NOT in git status (only `schema.ts`, `schemas.ts`,
  `project-x.ts`, and the two test files). ✓
- All existing tests pass (the parse fix restored the whole suite). ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The reverse index is built but not yet consumed by any UI (e.g. a "modified by Project X" warning on
  the affected glossary term / character detail). A follow-up UI task can render `projectsModifying(id)`.
- `schema.ts` ↔ `schemas.ts` remain a dual source of truth for the `modifies` shape; kept in sync manually.
