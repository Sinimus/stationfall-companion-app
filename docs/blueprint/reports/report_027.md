# Report: 027 — Contextual FAQ surfacing + provenance fields

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Surfaced relevant Q&A on the entities they relate to (progressive disclosure): a collapsed
"Specifické interakce a výjimky (N)" accordion on glossary terms (sheet), characters (dossier), and
sections (detail), driven by a reverse index over `faq.seeAlso`. Added optional provenance fields
(`sourceUrl`, `harvestedAt`) to `FaqEntry` for auditability.

## TDD Cycle
- **RED** — Wrote `faq.test.ts` + `faq-accordion.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `@/lib/faq` / `@/components/faq-accordion` unresolvable. Existing 59 tests passed.
- **GREEN** — Implemented the reverse index + accordion, added the provenance fields, and wired the
  accordion into the three surfaces. `pnpm test` PASS (63/63).

## Files Modified
- `src/data/schema.ts` — `FaqEntry` gains optional `sourceUrl?` / `harvestedAt?`.
- `src/data/schemas.ts` — `faqEntrySchema` gains `sourceUrl` / `harvestedAt` (both `z.string().optional()`).
- `src/lib/faq.ts` — new; reverse index `Map<seeAlsoId, FaqEntry[]>` built once at load; `faqFor(targetId)`
  returns the list (or `[]`).
- `src/components/faq-accordion.tsx` — new (`"use client"`); renders nothing when empty; otherwise a
  collapsed `<details>` with summary "Specifické interakce a výjimky (N)" and each Q&A (question +
  answer via `RuleText`). Uses `RuleText` only → no import cycle.
- `src/components/term-sheet.tsx` — renders `<FaqAccordion targetId={term.id} />` in the glossary branch
  (after the Project X warning) + import.
- `src/components/character-dossier.tsx` — renders `<FaqAccordion targetId={c.id} />` after the Project X
  warning + import.
- `src/components/section-detail.tsx` — renders `<FaqAccordion targetId={s.id} />` after the notes
  section + import.
- `src/lib/__tests__/faq.test.ts` + `src/components/__tests__/faq-accordion.test.tsx` — new.

## Pre-Implementation Data Verification
- Fixture holds: `revive-vyzaduje-kolokaci.seeAlso` includes `nanogel` (question "Vyžaduje akce Oživení
  kolokaci (stejnou sekci)?"); `nanogel` is a glossary term.
- Provenance fields (`sourceUrl`/`harvestedAt`) were NOT present in `faq.json` yet → adding them as
  optional to the `.strict()` schema is safe (no parse impact, no atomic data issue). The data currently
  carries `source` (the existing provenance); the two new fields are additive.

## Test Results
- `pnpm test` — PASS: 22 files, 63 tests. `faqFor("nanogel")` returns the related Q&A; empty for unknown
  targets; accordion lists with a count / renders nothing; all prior green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (faqFor + FaqAccordion; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports. ✓
3. Glossary terms / characters / sections with related Q&A show a collapsed "výjimky (N)" accordion;
   `FaqEntry` carries optional `sourceUrl`/`harvestedAt` — verified in built pages: the accordion is
   present on `out/sekce/okolni-vesmir.html` and on `out/postavy/{medik,piratka,inzenyr}.html` (entities
   referenced by some Q&A's `seeAlso`). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no data files edited
  (git status: only `schema.ts`, `schemas.ts`, the new `faq.ts`/`faq-accordion.tsx` + tests, and the three
  wiring edits to term-sheet/dossier/section-detail). ✓
- `FaqAccordion` uses `RuleText` (hook from `term-sheet-context`) — no import cycle. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The provenance fields `sourceUrl`/`harvestedAt` are typed + validated but not yet rendered anywhere
  (no data populates them yet); a future task can surface them for auditability.
- The accordion shows Q&A count in the summary but no deep-link/expand affordance per item (unlike the
  `/pruvodci#faq-<id>` deep-link of task 020); could be added if needed.
