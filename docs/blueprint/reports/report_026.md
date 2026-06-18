# Report: 026 — Wire 4 new procedural flows

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
The Architect appended 4 new flows to `src/data/flows.json` (now 8 total: original 4 + `stanu-se-podezrelym`,
`vypusteni-modulu`, `evakuace-abandon-ship`, `konec-minuty`). Updated the flow-count assertions; the new
flows render, static-generate, and index automatically (flow pages/search/list consume the collection
generically — no UI changes).

## Starting State
`flows.json` already had 8 entries (authored by the Architect; not edited by me), but the smoke + integrity
tests still asserted `flows` length 4 → the suite was already red at task start (2 failures).

## TDD Cycle
- **RED** — Ran `pnpm test`; confirmed FAIL: smoke + integrity assert `toHaveLength(4)` but data has 8
  (`expected 4, received 8`). Other 57 tests passed (the new flows parse fine — same shape).
- **GREEN** — Updated both count assertions `4 → 8`. `pnpm test` PASS (59/59).

## Files Modified
- `src/data/__tests__/data.smoke.test.ts` — `flows` `toHaveLength(4)` → `8`.
- `src/data/__tests__/data.integrity.test.ts` — `flows` `toHaveLength(4)` → `8`.
- (`src/data/flows.json` shows as modified in git status, but that is the Architect's pre-existing data
  append — I did NOT edit it.)

## Verification
- The new flows pass the existing generic invariants automatically: unique ids (integrity), Zod parse
  (same `causalFlowSchema` shape), and the cross-link checks. FlowView rendering is already covered by the
  existing `flow-view.test.tsx` (data-driven, not id-specific).
- `pnpm test` — PASS: 20 files, 59 tests.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: statically generates **8** `/pruvodci/<id>` pages (confirmed `ls out/pruvodci/*.html`
  = 8; all 4 new pages present, e.g. `out/pruvodci/stanu-se-podezrelym.html`).

## Acceptance Criteria Verified
1. `pnpm test` passes (flows count 8; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports 8 `/pruvodci/<id>` pages. ✓
3. `/pruvodci` lists 8 flows (8 distinct `/pruvodci/<id>` links confirmed); the 4 new flows are
   searchable and their step bodies linkify keywords — covered generically: `search.ts` indexes **all**
   flows unconditionally (`for (const fl of flows) add("flow", …)` → 8 indexed), and `FlowView` routes
   every step/branch body through `RuleText`. (Direct Node import of the `.ts` lib isn't possible due to
   the `@/` alias; the structural guarantee + passing search tests confirm it.) ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no edits to `src/data/flows.json` or any other data
  (only the two test files changed by me). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- A flow-specific search test (like the character/glossary/projectx/section ones) would make the
  "new flows are searchable" claim explicit rather than structural — could be added if desired.
