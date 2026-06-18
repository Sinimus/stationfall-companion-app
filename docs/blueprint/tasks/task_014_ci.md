# TASK 014: Continuous Integration (GitHub Actions)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Add a GitHub Actions workflow that runs the project's quality gates (lint, test, static build) on
every push to `main` and every pull request — green checks for the upcoming review.

> This is a CI **config** task (no TDD cycle). Verification is: the exact CI commands succeed locally
> against the committed lockfile, and the workflow is valid and mirrors them.

## 2. Files

- Create: `.github/workflows/ci.yml`
- Modify (if missing): add `"packageManager": "pnpm@10.28.2"` to `package.json` (pin pnpm for CI;
  match the locally-used pnpm major).

## 3. Steps

- [ ] **Verify the exact CI command chain passes locally** (this is what CI will run):
  ```bash
  pnpm install --frozen-lockfile
  pnpm lint
  pnpm test
  pnpm build
  ```
  Expected: all succeed. If `--frozen-lockfile` fails, the lockfile is out of sync — run `pnpm install`
  to refresh it and commit the updated `pnpm-lock.yaml` (do not weaken to a non-frozen CI install).

- [ ] **Add `packageManager` to `package.json`** (top level, if not already present):
  ```json
  "packageManager": "pnpm@10.28.2"
  ```

- [ ] **Create `.github/workflows/ci.yml`**:
  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Setup pnpm
          uses: pnpm/action-setup@v4

        - name: Setup Node
          uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: pnpm

        - name: Install
          run: pnpm install --frozen-lockfile

        - name: Lint
          run: pnpm lint

        - name: Test
          run: pnpm test

        - name: Build
          run: pnpm build
  ```
  (`pnpm/action-setup@v4` reads the pinned version from `package.json` `packageManager`.)

- [ ] **Sanity-check the YAML** is valid (no tabs; 2-space indent) and the four script names
  (`lint`, `test`, `build`) exist in `package.json`.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Do not modify data / `src/data/*` / application code. Only CI config (+ `packageManager` /
  refreshed lockfile if needed).
- Keep all existing tests passing (the CI just runs them).

## 5. Acceptance Criteria

1. `pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build` all succeed locally.
2. `.github/workflows/ci.yml` exists, triggers on push-to-main and PRs, and runs install (frozen) →
   lint → test → build on Node 22 with pnpm.
3. `package.json` pins `packageManager`.
4. Report written to `docs/blueprint/reports/report_014.md`.
