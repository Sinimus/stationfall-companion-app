# Report: 020 — FAQ deep-links (open question via URL hash)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
FAQ search results now link to `/pruvodci#faq-<id>` instead of `/pruvodci`, and the FAQ list
imperatively opens the targeted `<details>` on page load and on `hashchange` — no router dependency.

## TDD Cycle
- **RED** — Appended a hash-open test to `faq-list.test.tsx`; ran `pnpm test`. Confirmed FAIL: the
  `<details>` had no `id` / was not `open`. Existing 44 tests passed.
- **GREEN** — Added the `id` + `useEffect` hash opener and the `hrefFor` faq branch. `pnpm test` PASS (45/45).

## Files Modified
- `src/components/faq-list.tsx`:
  - `import { useState, useEffect }`.
  - `useEffect` (mount-only) defines `openFromHash()`: reads `window.location.hash`, early-returns unless
    it starts with `#faq-`, resolves `document.getElementById(hash.slice(1))`, opens it via an
    `instanceof HTMLDetailsElement` guard, and calls `scrollIntoView()` only when
    `typeof el.scrollIntoView === "function"`. Runs once on mount + subscribes to `hashchange`
    (cleans up on unmount).
  - Each `<details>` now has `id={`faq-${entry.id}`}`.
- `src/app/hledat/page.tsx` — `hrefFor` gains an `if (r.type === "faq") return \`/pruvodci#faq-${r.id}\`;`
  branch (inserted before the fallback). The character/flow/glossary/projectx paths are untouched.
- `src/components/__tests__/faq-list.test.tsx` — added the hash-open test.

## Test Results
- `pnpm test` — PASS: 16 files, 45 tests. The hash test sets `#faq-jak-anihilovat-antihmotu`, renders,
  and asserts the matching `<details>` is an `HTMLDetailsElement` with `open === true`; all prior green.
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (hash opens the targeted `<details>`; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports without errors. ✓
3. A `"faq"` search result links to `/pruvodci#faq-<id>` (`hrefFor` faq branch) and opens the correct
   question on page load + `hashchange` (the `useEffect` opener; verified by the unit test). Built
   `out/pruvodci.html` has 31 `<details id="faq-<id>">` anchors (incl. `faq-jak-anihilovat-antihmotu`). ✓
4. `scrollIntoView` is guarded (`typeof el.scrollIntoView === "function"`). ✓
5. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore` in production — the opener uses `el instanceof HTMLDetailsElement`
  (no type assertion); `as HTMLDetailsElement` appears only in the test file. ✓
- No edits to `src/data/*` or `term-sheet*.tsx`
  (git status: only `faq-list.tsx`, `faq-list.test.tsx`, `hledat/page.tsx`). ✓
- Only the `"faq"` branch of `hrefFor` changed; character/flow/projectx/glossary untouched. ✓
- All existing tests still pass. ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The hash opener is framework-free (plain `window`/`document`), so it works under static export
  without a router; if the app later adopts client-side routing, a `hashchange` listener is still
  sufficient (no router coupling added).
- The hash-open test mutates the global `window.location.hash` and resets it to `""` at the end; jsdom
  hash state is per-window and the vitest setup recreates the document per test, so no cross-test leak.
