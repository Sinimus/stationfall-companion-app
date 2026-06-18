# Report: 005 — Character detail (dossier)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added a full character "dossier" at `/postavy/[id]`, statically generated for all 28 characters:
collapsible `<details>` sections for abilities, reveal abilities, agendas (with point breakdown),
bonus points, edge cases, tips, and setup, with category-colored ability chips.

## TDD Cycle
- **RED** — Wrote `character-dossier.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `Failed to resolve import "@/components/character-dossier"`. Existing 14 tests still passed.
- **GREEN** — Implemented the dossier + detail route. `pnpm test` PASS (16/16).

## Files Modified
- `src/components/character-dossier.tsx` — new; `CharacterDossier` + `AbilityRow` (category chip via
  `CATEGORY_BG_CLASS`/`CATEGORY_LABEL`) + `Section` (`<details>`/`<summary>`, "Schopnosti" `open` by
  default). Sections for Schopnosti, Po odhalení, Úkoly, Bonusové body, Zvláštnosti, Tipy, Příprava hry.
- `src/app/postavy/[id]/page.tsx` — new; `generateStaticParams()` for all 28 ids, Next 16 async
  `params: Promise<{ id: string }>`, `notFound()` guard (typed `never`, no non-null assertion).
- `src/components/__tests__/character-dossier.test.tsx` — new (2 tests).

## Pre-Implementation Data Verification
Confirmed the `agentka` fixture assertions against the data before implementing:
- nameCs "Agentka"; ability "Důstojník"; reveal ability "Granáty s nervovým plynem";
- agendaTitle "ZAMETENÍ DŮKAZŮ"; edge case matches `/Mina nereaguje na Entropický přízrak/`.
All hold — no data edits needed.

## Test Results
- `pnpm test` — PASS: 6 files, 16 tests (data 7 + categories 2 + bottom-nav 2 + character-list 3 + dossier 2).
  Renders header, abilities, reveal abilities, agenda title, edge cases.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: 36 pages total; `/postavy/[id]` (SSG) exports all 28 character pages
  (`out/postavy/<id>.html`, e.g. `out/postavy/agentka.html`).

## Acceptance Criteria Verified
1. `pnpm test` passes (header, abilities, reveal abilities, agendas, edge cases). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports 28 static `/postavy/<id>` pages (28 confirmed via `ls`). ✓
3. Sections collapsible (`<details>`); "Schopnosti" `open` by default (verified `<details open>` in
   `out/postavy/agentka.html`); ability chips colored by category (`bg-cat-pohybove`, `bg-cat-utocne`). ✓
4. Report written. ✓

## Constraints Verified
- No `any`, `as any`, `@ts-ignore`; no edits to `src/data/*` or `categories.ts`
  (git status shows only new component + route + test). ✓
- `notFound()` typed `never` — no non-null assertion after the guard. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Agenda line uses array index as `key` (`key={i}`) — list order is stable/data-defined, so acceptable,
  but a stable id would be preferable if agendas gain identities later.
- No back-link / breadcrumb from dossier to `/postavy` list yet (out of scope; could be added in a polish task).
