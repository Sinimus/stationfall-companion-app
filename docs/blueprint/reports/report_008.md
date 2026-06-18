# Report: 008 — Procedural guides (flows)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Rendered the 4 procedural guides: `/pruvodci` lists them as tappable cards, and `/pruvodci/[id]`
(statically generated) shows the step-by-step flow with positional branches, keyword cross-links
(via `RuleText`) and rule references.

## TDD Cycle
- **RED** — Wrote `flow-view.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/flow-view"`. Existing 23 tests still passed.
- **GREEN** — Implemented flow-view + detail route + landing. `pnpm test` PASS (24/24).

## Files Modified
- `src/components/flow-view.tsx` — new; `FlowView` renders flow title, optional intro (RuleText),
  ordered step list with per-step body (RuleText), positional branches (`label:` + RuleText body),
  and rule refs. Steps/branches keyed by index.
- `src/app/pruvodci/[id]/page.tsx` — new; `generateStaticParams()` for all 4 flow ids, Next 16 async
  `params`, `notFound()` guard (typed `never`, no non-null assertion).
- `src/app/pruvodci/page.tsx` — replaced the task-003 stub; "Postupy" section with 4 flow Link cards
  (title + optional intro). (Q&A section deferred to task 009.)
- `src/components/__tests__/flow-view.test.tsx` — new (1 test).

## Pre-Implementation Data Verification
Confirmed the `detonace-antihmoty` fixture assertions before implementing:
- title "Detonace antihmoty"; step[0] title "Kdy se odjistí";
- step[2] "Výsledek podle pozice" has branches labeled "Okolní vesmír", "Mezosféra", "Na stanici"
  (rendered as `label:` → "Okolní vesmír:" / "Na stanici:" as the test expects).
All hold — no data edits needed.

## Test Results
- `pnpm test` — PASS: 10 files, 24 tests (prior 23 + flow-view 1). Flow title, step, branch labels render.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: exports `/pruvodci` + all 4 `/pruvodci/<id>` pages (konec-hry-scoring,
  detonace-antihmoty, uroven-energie-blackout, spusteni-projektu-x-flow), SSG via generateStaticParams.

## Acceptance Criteria Verified
1. `pnpm test` passes (flow title, step, positional branch labels). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` and all 4 `/pruvodci/<id>` pages. ✓
3. Flow bodies and branch bodies route through `RuleText` — `out/pruvodci/detonace-antihmoty.html`
   has 8 linkified keyword buttons; rule refs shown for every step that has them
   (`Pravidla: 7.3, 7.3.1, 13.5, 13.12` / `7.3.1, 7.3.3, 15.7` / `7.3.2`). ✓
4. `/pruvodci` lists the 4 flows linking to their detail pages (4 distinct `/pruvodci/<id>` links). ✓
5. Report written. ✓

## Note for Reviewer
In the static HTML, rule-ref paragraphs render as `<p ...>Pravidla: <!-- -->7.3.2</p>` — React inserts
a `<!-- -->` comment between the adjacent JSX text nodes ("Pravidla: " and the joined refs). This is
React's standard text-boundary marker (invisible to users); the content is fully present in visible
HTML. It only defeats naive contiguous-string checks, not rendering.

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no edits to `src/data/*` or `term-sheet.tsx`
  (git status shows only new flow-view + [id] route + test, and the modified landing page). ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Steps/branches keyed by index (`key={i}`/`key={j}`) — stable for static flow data; a content key
  would be preferable if steps gain identities.
- `/pruvodci` landing's Q&A section is deferred to task 009 (per task note).
