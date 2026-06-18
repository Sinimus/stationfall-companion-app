# Report: 017 — Typed linkify + clickable character names

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Generalized the inline linkifier to return typed references (`LinkRef`: `glossary` | `character`) and
to link **character names** in text to their detail page (previously only glossary terms linked).
`splitGlossaryText` is renamed to `splitText`; `RuleText` now renders glossary refs as sheet buttons and
character refs as `<Link>` to `/postavy/<id>`. Introduces the `LinkRef` type that task 018 will extend.

## TDD Cycle
- **RED** — Rewrote `linkify.test.ts` to the new `splitText` typed API; ran `pnpm test`. Confirmed FAIL:
  `splitText is not a function` (5 linkify tests). Other 38 tests still passed (rule-text still used the
  old name).
- **GREEN** — Rewrote `linkify.ts` + `rule-text.tsx` together (removing `splitGlossaryText` requires
  both), appended the character-link test. `pnpm test` PASS (41/41).

## Files Modified
- `src/lib/linkify.ts` — rewritten; `LinkRef = { kind: "glossary" | "character"; id: string }`,
  `TextPart = { text: string; ref?: LinkRef }`. `entries` now flat-maps glossary names+aliases AND all
  character `nameCs` (each carrying its typed `ref`), sorted longest-first. `refByLowerName` map +
  the same Unicode-boundary regex. `splitText()` replaces `splitGlossaryText()`.
- `src/components/rule-text.tsx` — rewritten; uses `splitText`; glossary ref → `<button onClick={openTerm}>`,
  character ref → `<Link href="/postavy/<id>">`, plain text → `<Fragment>`. Shared `LINK_CLASS`.
- `src/lib/__tests__/linkify.test.ts` — rewritten to the typed `splitText` API (glossary term, character
  name → character kind, HP alias → `{kind:"glossary", id:"hracova-postava"}`, no in-word match, round-trip).
- `src/components/__tests__/rule-text.test.tsx` — appended the character-link test (Pirátka → /postavy/piratka).

## Pre-Implementation Verification
- Confirmed `splitGlossaryText` was used only in `linkify.ts`, its test, and `rule-text.tsx` (grep), so the
  rename is fully covered.
- No collisions: character `nameCs` values don't overlap any glossary name/alias (lowercased), no duplicate
  lowercased character names, no character named "Data" (so the "database" boundary test stays valid).
- The asserted dossier edge case ("Mina nereaguje na Entropický přízrak…") and the rule-text test string
  contain no character name (and no glossary term) → they still render as a single fragment; existing
  `getByText` assertions are unaffected.

## Test Results
- `pnpm test` — PASS: 16 files, 41 tests. `splitText` returns typed glossary + character refs; HP alias
  resolves to the glossary term; RuleText renders a character name as a `/postavy/<id>` link; all prior green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (typed `splitText`: glossary + character refs; HP alias; rule-text char link). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes. ✓
3. Character names in rendered text link to `/postavy/<id>`; glossary keywords still open the sheet —
   verified in built pages: `strazce` links to `kyborg` + `piratka`, `kyborg`→`strazce`, `piratka`→`strazce`.
   (agentka's page only self-links because its text doesn't name other characters — data-dependent, not a bug.) ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; used `kind: "glossary" as const`/`"character" as const` for literal narrowing. ✓
- No edits to `src/data/*` or `term-sheet*.tsx`
  (git status: only `linkify.ts`/`linkify.test.ts` + `rule-text.tsx`/`rule-text.test.tsx`). ✓
- `splitGlossaryText` fully renamed to `splitText`; no remaining importers of the old name. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- Character name matching is exact whole-phrase (no Czech declension handling) — "Pirátce" (declined) is
  not linked, only the canonical "Pirátka". This is consistent with the glossary behavior; per-term match
  aliases (task 011's `aliases` field, glossary-only) could be extended to characters later if needed.
- The combined alternation regex now includes character names (~28 more entries) — still small and built
  once at module load.
