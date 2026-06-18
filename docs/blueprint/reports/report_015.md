# Report: 015 — Linkify keywords inside glossary definitions

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Made keywords tappable inside a term's definition text in the bottom-sheet (previously plain text, so
a definition referencing another term was a dead-end). Broke the `RuleText` ↔ `TermSheet` circular
import by extracting the context + hook into its own module, then routed the definition through
`RuleText`.

## TDD Cycle
- **RED** — Appended a definition-linkify test to `term-sheet.test.tsx`; ran `pnpm test`. Confirmed
  FAIL: the definition rendered as plain text (`Unable to find an accessible element with the role
  "button" and name "autodestrukce"`). Existing 37 tests passed.
- **GREEN** — Extracted the context, refactored both components. `pnpm test` PASS (38/38).

## Files Modified
- `src/components/term-sheet-context.tsx` — new (`"use client"`); `TermSheetCtx` type,
  `TermSheetContext = createContext(...)`, `useTermSheet()` hook. A leaf module (imports nothing from
  `term-sheet`/`rule-text`) — this is what breaks the cycle.
- `src/components/term-sheet.tsx` — removed local `createContext`/`useContext`/`useTermSheet`/`Ctx`;
  imports `TermSheetContext` from the context module; `export { useTermSheet } from
  "@/components/term-sheet-context"` (re-export keeps the public API stable); uses
  `<TermSheetContext.Provider>`; renders `<p className="text-sm"><RuleText>{term.text}</RuleText></p>`.
  Imports `RuleText`. seeAlso / related-characters / ruleRefs sections unchanged.
- `src/components/rule-text.tsx` — changed the `useTermSheet` import to `@/components/term-sheet-context`
  (no longer depends on `term-sheet.tsx`, so `term-sheet → rule-text → term-sheet-context` is acyclic).
- `src/components/__tests__/term-sheet.test.tsx` — added the definition-linkify test (`within`/`userEvent`
  were already imported).

## Pre-Implementation Verification
- antihmota's definition text contains the whole word "autodestrukce" (lowercase, mid-sentence), which
  is the glossary term `autodestrukce` (nameCs "Autodestrukce"). Linkify matches case-insensitively, so
  the rendered button text is the source's lowercase "autodestrukce" — exactly what the test asserts.

## Acyclic import graph (verified)
- `term-sheet-context.tsx` → (leaf; no imports from the other two)
- `rule-text.tsx` → `term-sheet-context.tsx`
- `term-sheet.tsx` → `term-sheet-context.tsx` + `rule-text.tsx`
No cycle. Build produced no circular-import warning.

## Test Results
- `pnpm test` — PASS: 16 files, 38 tests (prior 37 + definition-linkify 1). "autodestrukce" renders as
  a button inside the Antihmota dialog.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export; no circular/warning/error output.

## Acceptance Criteria Verified
1. `pnpm test` passes (definition linkify + all prior). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes; no circular dependency (confirmed by the
   import graph and clean build). ✓
3. Opening a glossary term whose definition references another term shows that keyword as a tappable
   button (Antihmota → "autodestrukce" button), which switches the sheet via `openTerm`. ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore`; no edits to `src/data/*`
  (git status: only `term-sheet-context.tsx` new + `term-sheet.tsx`/`rule-text.tsx`/test modified). ✓
- Public API preserved: `useTermSheet` and `TermSheetProvider` remain importable from
  `@/components/term-sheet` (re-export); all existing importers/tests unaffected. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The context is now in a dedicated module but still lives under `src/components/` (a `.tsx` file). It
  could move to `src/lib/` if a stricter lib/component split is desired later; left as-is to minimize
  churn and keep the `"use client"` boundary explicit.
