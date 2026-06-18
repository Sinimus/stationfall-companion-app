# Report: 013 — PWA (installable + offline)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Made the app an installable, offline-capable PWA: a web manifest (`/manifest.webmanifest`), a
placeholder SVG app icon, and a dependency-free hand-written service worker (`/sw.js`,
cache-first + network-update, resilient precache via `allSettled`) registered on load via `<SWRegister/>`.

## TDD Cycle
- **RED** — Wrote `manifest.test.ts` + `sw-register.test.tsx`; ran `pnpm test`. Confirmed FAIL:
  `@/app/manifest` and `@/components/sw-register` unresolvable. Existing 35 tests passed.
- **GREEN** — Implemented all five pieces; `pnpm test` PASS (37/37). (A build-time issue surfaced
  afterward — see Deviation 1 — fixed before the build passed.)

## Files Modified
- `src/app/manifest.ts` — new; Next metadata route emitting the installable manifest (name, short_name,
  description, `start_url: "/postavy"`, `display: "standalone"`, theme/background `#0a0a0a`, icon).
- `public/icon.svg` — new; placeholder SVG icon (rounded dark square + orbit motif).
- `public/sw.js` — new; plain-JS service worker (cache `sf-v1`, precache CORE via `allSettled`,
  `skipWaiting`/`clients.claim`, cache-old-then-network-update fetch, GET + same-origin only).
- `src/components/sw-register.tsx` — new (`"use client"`); registers `/sw.js` on mount only when
  `"serviceWorker" in navigator` (guards jsdom where it's absent), renders nothing.
- `src/app/layout.tsx` — added `icons` to metadata, `export const viewport: Viewport` (themeColor),
  and `<SWRegister/>` in `<body>`.
- `src/app/__tests__/manifest.test.ts` + `src/components/__tests__/sw-register.test.tsx` — new.

## Deviation from Task Spec
1. **`export const dynamic = "force-static"` added to `manifest.ts`.** Next.js 16 refuses to collect
   page data for the `/manifest.webmanifest` metadata route under `output: "export"` unless it is
   explicitly marked static: `Error: export const dynamic = "force-static"/export const revalidate not
   configured on route "/manifest.webmanifest" with "output: export".` The task's `manifest.ts`
   predates this Next 16 requirement; without the export the entire build fails. The fix is exactly
   the route-segment config the error prescribes. The manifest unit test still passes (it imports the
   default function; the extra export is inert at runtime).

## Test Results
- `pnpm test` — PASS: 16 files, 37 tests (prior 35 + manifest 1 + sw-register 1). Manifest fields
  correct; `SWRegister` renders nothing & doesn't throw without serviceWorker.
- `pnpm lint` — PASS: zero warnings/errors (`public/sw.js` worker globals are not flagged — the TS
  lint config applies to `.ts/.tsx`; sw.js stays framework-free as required).
- `pnpm build` — PASS (after the force-static fix); emits `out/manifest.webmanifest`, `out/sw.js`,
  `out/icon.svg`.

## Acceptance Criteria Verified
1. `pnpm test` passes (manifest + sw-register + all prior). ✓
2. `pnpm lint` zero warnings; `pnpm build` emits `out/manifest.webmanifest`, `out/sw.js`, `out/icon.svg`
   and `<link rel="manifest" href="/manifest.webmanifest"/>` is present in `out/postavy.html`
   (also `<meta name="theme-color" content="#0a0a0a"/>`, `<link rel="icon" href="/icon.svg"/>`,
   `<link rel="apple-touch-icon" href="/icon.svg"/>`). ✓
3. Installable (manifest + icon + `display: standalone`) and registers the service worker on load
   (`<SWRegister/>` in the layout, guarded). ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`@ts-ignore` in TS files; `public/sw.js` is plain JS, framework-free, not part of
  the TS project (tsconfig `include` is `**/*.{ts,tsx,mts}`, so `.js` isn't compiled). ✓
- No edits to `src/data/*` or `term-sheet.tsx` (git status: only new manifest/icon/sw/sw-register +
  tests, and the modified layout). ✓
- SW not registered during tests (guard handles jsdom; verified). ✓
- All existing tests still pass. ✓

## Technical Debt
- The SVG icon is a placeholder; branded PNG icons (192/512) are deferred to v0.2 (per design note).
- The SW precaches only the 7 CORE URLs (no build-time precaching of hashed `_next` chunks); runtime
  fetch handler caches chunks on first load (stale-while-revalidate-style). Build-time hashed-chunk
  precaching (Serwist) is a possible v0.2 hardening (per design note).
- `next lint` is still replaced by `eslint` (Next 16, task 001) — unrelated to this task but noted.
