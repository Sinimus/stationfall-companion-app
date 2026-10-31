# Report: 034 — Browser test against the production image, deploy only after it

**Status:** READY_FOR_REVIEW
**Date:** 2026-10-31
**Implemented by:** Architect (the Constructor run failed on an expired ZCode login; the owner approved the exception)

## Summary
Playwright smoke test (`e2e/`) against the nginx production image, run in `ci.yml` after a container
smoke test; `deploy.yml` calls `ci.yml` and `build-and-deploy` needs it.

## Files
- Created: `e2e/routes.json`, `e2e/smoke.spec.ts`, `playwright.config.ts`.
- Modified: `package.json` (`test:e2e`, `@playwright/test` 1.64.1, exact), `pnpm-lock.yaml`,
  `vitest.config.ts` (`include: src/**/*.test.{ts,tsx}`), `.gitignore`, `.github/workflows/ci.yml`
  (triggers `pull_request` + `workflow_call`, job `docker-build`), `.github/workflows/deploy.yml`
  (job `checks`, `needs: checks`), `README.md`.

## Results (local)
- `pnpm lint` 0 warnings; `pnpm test` 25 files, 75 tests (unchanged; without the `include` vitest
  collects the Playwright spec and fails); `pnpm build` ok; `tsc --noEmit` ok.
- `playwright test` against the image built from the `Dockerfile` (OrbStack): 11 passed.
- Negative test: in a separate image the `/sekce` heading was renamed and the search page was made
  to throw on the query `Agentka`. Exactly the `/sekce` route test and the search test failed (2
  failed, 9 passed); the source was restored afterwards.
