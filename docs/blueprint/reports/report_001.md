# Report: 001 — Project skeleton, tooling & data module

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-17

## Summary
Scaffolded a Next.js 16 App Router static-export skeleton (TS strict, Tailwind v4, Vitest) into the
existing project root, relocated the `data/` content into `src/data/` via `git mv` (history
preserved), and proved the data package loads with a passing smoke test.

## TDD Cycle
- **RED** — Wrote `src/data/__tests__/data.smoke.test.ts`, ran `pnpm test`. Confirmed FAIL:
  `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` (no `package.json` / test runner; project not scaffolded).
- **GREEN** — Scaffolded, moved data, added tooling/config. `pnpm test` now PASSES (2/2).

## Files Modified
- `src/data/__tests__/data.smoke.test.ts` — new data smoke test (counts 28/109/4/8/31 + id/nameCs checks).
- `next.config.ts` — replaced scaffold default with static export config (`output: "export"`, `images.unoptimized`).
- `package.json` — renamed to `stationfall-companion-app`; added `test`/`test:watch` scripts; vitest + vite-tsconfig-paths devDeps.
- `src/app/page.tsx` — replaced marketing boilerplate with minimal placeholder.
- `vitest.config.ts` — new; tsconfig-paths plugin, node environment, `globals: false`.
- `.gitignore` — appended Next.js artifact ignores (`.next/`, `out/`, `next-env.d.ts`, `*.tsbuildinfo`).
- Scaffold-generated (untracked, new): `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`,
  `next-env.d.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `public/`, `src/app/{layout,globals.css,favicon.ico}`.
- Moved (git mv, 100% similarity, content unchanged):
  `data/{characters,glossary,flows,projectsX,faq}.json`, `data/schema.ts`, `data/README.md` → `src/data/`.

## Environment Used
- Package manager: pnpm 10.28.2 (Node v24.11.1, fnm)
- Framework versions: Next.js 16.2.9, React 19.2.4, Tailwind v4.3.1, TypeScript 5.9.3,
  Vitest 4.1.9, ESLint 9.39.4 (eslint-config-next 16.2.9)

## Deviations from Task Spec
1. **`lint` script = `eslint`, not `next lint`.** Next.js 16 removed/broke the `next lint` subcommand
   (`next lint` is parsed as a directory and errors: "Invalid project directory ... /lint"). The
   scaffold ships `"lint": "eslint"` with a flat-config `eslint.config.mjs`, which is the correct
   Next 16 approach. The task's `next lint` predates Next 16; using it would make acceptance
   criterion 3 (`pnpm lint` passes) impossible. `pnpm lint` now runs `eslint` and exits 0.
2. **`AGENTS.md` preserved.** The scaffold also generated an `AGENTS.md` (Next.js "this is NOT the
   Next.js you know" note) and a `CLAUDE.md` (`@AGENTS.md` pointer). Both were excluded from the
   rsync merge to protect the project's Beast-Protocol `AGENTS.md`. The Next.js note is not lost —
   it lives in `node_modules/next/dist/docs/` per its own guidance.
3. **`.next/` excluded from rsync** (build artifact) in addition to the task's excludes.
4. **`.gitignore` appended** with Next.js artifact entries (existing entries untouched); the
   preserved project `.gitignore` had no Next.js entries, so build output was showing as untracked.

## Test Results
- `pnpm test` — PASS: 1 file, 2 tests (counts 28/109/4/8/31 ✓, id+nameCs truthy ✓).
- `pnpm build` — PASS: static export, `out/index.html` produced (routes `/`, `/_not-found`, all `○ Static`).
- `pnpm lint` — PASS: zero warnings/errors.

## Constraints Verified
- `data/_sources/processed-threads.json` untouched; `docs/`, `.kilo/`, `.claude/` untouched.
- Moved JSON/`schema.ts` content unchanged (git reports pure renames, 100% similarity).
- No `any`, `as any`, or `@ts-ignore` introduced.

## Technical Debt
- `vite-tsconfig-paths` prints a deprecation notice (Vite now supports tsconfig paths natively via
  `resolve.tsconfigPaths`). Kept as-is per task spec; can be migrated to native `resolve.tsconfigPaths: true`
  in a future refactor (it would also drop the `vite-tsconfig-paths` dependency).
- `src/app/layout.tsx` retains scaffold defaults (title "Create Next App", Geist fonts). Left untouched
  to avoid scope creep; not part of this task's file list.
- `public/` still contains scaffold placeholder SVGs (next.svg, vercel.svg, etc.); harmless for a skeleton.
