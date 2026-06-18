# Report: 014 — Continuous Integration (GitHub Actions)

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Added a GitHub Actions CI workflow that runs the project's quality gates (frozen install → lint →
test → build) on every push to `main` and every pull request, and pinned the package manager in
`package.json` so CI uses the same pnpm version.

> This is a CI **config** task (no TDD cycle per the task spec); verification = the exact CI command
> chain succeeds locally against the committed lockfile, and the workflow mirrors it.

## Files Modified
- `.github/workflows/ci.yml` — new; `name: CI`, triggers `push: branches: [main]` + `pull_request`,
  single `build` job on `ubuntu-latest`, steps: `actions/checkout@v4` → `pnpm/action-setup@v4`
  (reads the pinned version from `packageManager`) → `actions/setup-node@v4` (node 22, `cache: pnpm`)
  → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`.
- `package.json` — added top-level `"packageManager": "pnpm@10.28.2"` (matches the locally-used pnpm).

## Local Verification (the exact CI chain)
Ran each step locally against the committed lockfile:
- `pnpm install --frozen-lockfile` → exit 0 ("Lockfile is up to date" / "Already up to date").
  Re-verified after adding `packageManager` (still exit 0 — the pin doesn't desync the lockfile).
- `pnpm lint` → exit 0 (zero warnings).
- `pnpm test` → exit 0 (16 files, 37 tests).
- `pnpm build` → exit 0 (all routes export).

## Sanity Checks
- YAML validated (parses; no tabs; 2-space indent): triggers `push, pull_request`, `runs-on:
  ubuntu-latest`, `node-version: 22`, step order checkout → Setup pnpm → Setup Node → Install →
  Lint → Test → Build.
- The four required script names exist in `package.json` (`lint`, `test`, `build`, plus `dev`/`start`/`test:watch`).
- `pnpm@10.28.2` matches the local pnpm (`pnpm --version` = 10.28.2).

## Note for Reviewer
While validating the YAML with Ruby's `psych`, the bare `on:` key is coerced to boolean `true`
(a YAML 1.1 quirk). This is a parser artifact only — GitHub Actions uses its own YAML parser that
treats `on:` as a string trigger key, so the workflow is correct. Validated structurally by reading
the coerced key.

## Acceptance Criteria Verified
1. `pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build` all succeed locally. ✓
2. `.github/workflows/ci.yml` exists, triggers on push-to-main and PRs, runs install (frozen) → lint →
   test → build on Node 22 with pnpm. ✓
3. `package.json` pins `packageManager` (`pnpm@10.28.2`). ✓
4. Report written. ✓

## Constraints Verified
- No edits to data / `src/data/*` / application code / `term-sheet.tsx`
  (git status: only `package.json` modified and new `.github/`). ✓
- `--frozen-lockfile` retained in CI (not weakened to a non-frozen install); lockfile was in sync, no
  refresh needed. ✓
- All existing tests pass (CI just runs them). ✓

## Technical Debt
- CI runs all gates in a single job sequentially. Splitting lint/test/build into parallel jobs (or a
  matrix across Node versions) could speed up feedback, but a single linear job is simplest for MVP.
- No artifact upload of the static `out/` export yet; could be added if a deploy step is introduced.
