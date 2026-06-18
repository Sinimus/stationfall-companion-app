# TASK 026: Wire 4 new procedural flows

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

The Architect appended 4 new flows to `src/data/flows.json` (now 8 total). Update the flow-count
assertions and confirm the new flows render, static-generate and index — no UI changes needed (the
flow pages/search already consume the collection generically).

> `src/data/flows.json` already contains the 4 new flows (`stanu-se-podezrelym`, `vypusteni-modulu`,
> `evakuace-abandon-ship`, `konec-minuty`) — DO NOT edit it.

## 2. Files

- Modify: `src/data/__tests__/data.smoke.test.ts` (flows 4 → 8)
- Modify: `src/data/__tests__/data.integrity.test.ts` (flows 4 → 8)

## 3. Implementation Steps (TDD)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — smoke + integrity assert `flows` length 4 but the data now has 8.

- [ ] **Update the flow count** in both test files: change `expect(flows).toHaveLength(4)` →
  `expect(flows).toHaveLength(8)`.

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — all suites green (the existing unique-id / cross-link checks already cover the new
  flows; FlowView rendering is already tested).

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build statically generates **8** `/pruvodci/<id>` pages (the 4 new
  ones included, e.g. `out/pruvodci/stanu-se-podezrelym.html`), and `/pruvodci` lists all 8 flows.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit `src/data/flows.json` or any other data.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (flows count 8; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports 8 `/pruvodci/<id>` pages.
3. `/pruvodci` lists 8 flows; the 4 new flows are searchable and their step bodies linkify keywords.
4. Report written to `docs/blueprint/reports/report_026.md`.
