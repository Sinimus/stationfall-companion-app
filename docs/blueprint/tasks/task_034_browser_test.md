# TASK 034: Browser test against the production image, deploy only after it

> **Status:** DONE
> **Assigned to:** Constructor (ZCode, GLM main); implemented by the Architect with the owner's approval, because the ZCode login to Z.ai had expired (`project_token_login_failed`)

## 1. Goal

Vitest runs in jsdom and never loads the Next bundle in a real browser, and `deploy.yml` builds and
ships the image without any check. Add a Playwright smoke test that runs against the **production
image** (the nginx stage of the `Dockerfile`), run it in CI after a container smoke test, and make
`deploy.yml` start only after the same checks.

The static HTML already contains the headings, so a heading check alone does not prove that the
JavaScript bundle works. The test therefore also needs interactions that exist only after hydration.

Context: the same change is already live in jotl-companion, hegemony-companion-app,
gwt-new_zealand-companion and root-companion. This repo has no `e2e/` yet.

## 2. Files (whitelist)

Create:
- `e2e/routes.json`
- `e2e/smoke.spec.ts`
- `playwright.config.ts`

Modify:
- `package.json` (script `test:e2e`, devDependency `@playwright/test`)
- `pnpm-lock.yaml` (by pnpm only)
- `vitest.config.ts` (restrict `include`, see 3.4)
- `.gitignore` (Playwright output)
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `README.md` (short section, see 3.7)

Touch nothing else. In particular not `src/`, `Dockerfile`, `nginx.conf`, `pnpm-workspace.yaml`,
`renovate.json`. Do not run Docker; the Architect builds and runs the image.

## 3. Implementation

### 3.1 Dependency (the only allowed installation)

```bash
pnpm add -D @playwright/test
```

`pnpm-workspace.yaml` has `minimumReleaseAge` of 7 days and `savePrefix: ''`, so pnpm picks the
newest version at least 7 days old and writes it without `^`. Do not pass `--ignore-workspace`, do
not edit `minimumReleaseAge`, do not install anything else (no `pnpm add` of other packages, no
`npm`, no `npx`). If the command fails, stop and report the error text. Browser binaries: do **not**
run `playwright install`; the Architect does it.

### 3.2 `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

// Runs against an already running production image (CI starts it from the
// same Dockerfile the deploy uses); E2E_BASE_URL points elsewhere if needed.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

`package.json`: add `"test:e2e": "playwright test"`. Keep `"test": "vitest run"` unchanged.

### 3.3 `e2e/routes.json` and `e2e/smoke.spec.ts`

`routes.json` lists the five list pages, each with the element the test waits for. The headings of
`/postavy`, `/glosar`, `/sekce` are `sr-only` `h1` (still visible to Playwright); `/hledat` has no
heading, only an `input type="search"` with `aria-label="Hledat"` (role `searchbox`).

```json
[
  { "path": "/postavy", "role": "heading", "name": "Postavy" },
  { "path": "/glosar", "role": "heading", "name": "Glosář" },
  { "path": "/sekce", "role": "heading", "name": "Sekce" },
  { "path": "/pruvodci", "role": "heading", "name": "Průvodci" },
  { "path": "/hledat", "role": "searchbox", "name": "Hledat" }
]
```

`smoke.spec.ts` (TypeScript strict, no `any`, no `@ts-ignore`, double quotes, semicolons like the
rest of the repo). Shared helper, same idea as in the other repos:

```ts
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}
```

Every test calls `collectErrors(page)` first and ends with `expect(errors).toEqual([])`.

Tests:

1. **One test per entry of `routes.json`**, title `` `${path} renders "${name}"` ``: `page.goto(path)`,
   then `expect(page.getByRole(role, { name, exact: true })).toBeVisible()`. For headings use
   `level: 1`. (Type the JSON entries with a small local type; `role` is `"heading" | "searchbox"`.)
2. **Detail pages, all of them**, three tests (characters, sections, flows), each looping over all
   ids and visiting every page `/postavy/<id>`, `/sekce/<id>`, `/pruvodci/<id>`. The expected `h1`
   is `nameCs` (characters, sections) or `title` (flows). Read ids and names from
   `../src/data/characters.json`, `sections.json`, `flows.json` (plain JSON import, no `src/data/index.ts`,
   which pulls in zod and app code). On a missing heading the assertion message must contain the
   path (use `expect(locator, path)`). Collect errors per test as above. Set
   `test.setTimeout(60_000)` for these three.
3. **Redirect from the bundle**: `page.goto("/")` then `await expect(page).toHaveURL(/\/postavy$/)`
   and the `Postavy` heading visible. The home page is a client component that redirects in
   `useEffect`, so this fails if the bundle does not run.
4. **Search interaction**: `/hledat`, fill the searchbox `Hledat` with `Agentka`, expect a link whose
   accessible name starts with `Agentka` to be visible, click it, expect URL `/postavy/agentka` and
   `h1` `Agentka`.
5. **Glossary sheet**: `/glosar`, click the button named `Konspirátor` (exact), expect a visible
   `dialog` named `Konspirátor`, click the button `Zavřít`, expect the dialog to be gone.

If any selector does not match what the page really renders, do not weaken the assertion: read the
component under `src/components` and fix the selector, and mention it in the report.

### 3.4 Keep vitest away from the spec

Playwright specs use `test` from `@playwright/test` and would be collected by vitest. In
`vitest.config.ts` add `include: ["src/**/*.test.{ts,tsx}"]` inside `test`. The number of unit tests
must stay exactly what it is today (record the number before and after in the report).

### 3.5 `.gitignore`

Add a block `# --- Playwright ---` with `/test-results/` and `/playwright-report/`.

### 3.6 Workflows

**`ci.yml`**: triggers become `pull_request: branches: [main]` and `workflow_call:` (remove
`push`, otherwise a push to `main` would run the checks twice once `deploy.yml` calls them). Add
`permissions: contents: read` at the top. Keep job `build` as is. Add job `docker-build` with
`needs: build`:

1. `actions/checkout@v4`
2. Build the production image with `docker/build-push-action@v6`: `context: .`, `push: false`,
   `load: true`, `tags: stationfall-companion:ci`.
3. Smoke test the image: run `docker run --detach --name smoke --publish 8080:80
   stationfall-companion:ci`, poll `curl --silent --fail --output page.html http://localhost:8080/`
   up to 30 times with `sleep 2`, then `set -e`, fetch once more and
   `grep --quiet '<title>Stationfall Companion</title>' page.html`.
4. Browser test against the same container: `pnpm/action-setup@v4`, `actions/setup-node@v4` with
   `node-version: 24` and `cache: pnpm` (same values as the `build` job), `pnpm install
   --frozen-lockfile`, `pnpm exec playwright install --with-deps chromium`, then `pnpm test:e2e` with
   `env: E2E_BASE_URL: http://localhost:8080`.
5. `actions/upload-artifact@v4` with `if: failure()`, name `playwright-traces`, path
   `test-results/`, `retention-days: 7`.
6. Final step `if: always()`: `docker logs smoke || true` and `docker rm --force smoke || true`.

Add a comment above the browser test step: every page and interaction in `e2e/` must work against
the same container the deploy ships.

**`deploy.yml`**: add job `checks` (before `build-and-deploy`):

```yaml
  # Lint, unit tests, build, image smoke test and browser test; nothing is
  # pushed or deployed unless they pass
  checks:
    uses: ./.github/workflows/ci.yml
    permissions:
      contents: read
```

and `needs: checks` on `build-and-deploy`. Leave triggers, `concurrency`, `env` and every other step
of `build-and-deploy` as they are.

### 3.7 README

Add a short subsection (English, same register as the surrounding README) under the existing
testing or development part: `pnpm test:e2e` runs the Playwright test against a running production
image on `localhost:8080` (`E2E_BASE_URL` overrides), the one-time `pnpm exec playwright install
chromium`, how to start the image (`docker build -t stationfall-companion:e2e . && docker run
--rm --detach --name stationfall-e2e --publish 8080:80 stationfall-companion:e2e`), what is
covered (list pages, every character, section and flow page, the redirect from `/`, search, the
glossary sheet), and that `deploy.yml` now calls `ci.yml` so a push to `main` reaches GHCR and
Coolify only after lint, unit tests, build, the image smoke test and the browser test. Do not
rewrite other parts of the README.

## 4. Acceptance criteria

- [ ] `pnpm lint` exits 0 with no warnings.
- [ ] `pnpm test` exits 0 and runs the same number of tests as before the change.
- [ ] `pnpm build` exits 0.
- [ ] `pnpm exec playwright test --list` lists 5 route tests, 3 detail-page tests, the redirect, the
      search and the glossary test (11 in total) and does not error.
- [ ] `pnpm exec tsc --noEmit` exits 0 (the e2e files are inside the tsconfig `include`).
- [ ] `package.json` has `@playwright/test` as an exact version (no `^`) in `devDependencies`.
- [ ] The only changed files are the ones in section 2.
- [ ] `ci.yml` and `deploy.yml` are valid YAML (`python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" FILE`
      for each, if PyYAML is available; otherwise say so in the report).

## 5. Test commands (the only ones to run)

```bash
pnpm lint && pnpm test && pnpm build && pnpm exec tsc --noEmit && pnpm exec playwright test --list
```

Do not run `playwright test` itself (no server is running). Do not start `next dev`/`next start`.
Do not install anything beyond 3.1. Do not commit.

## 6. Report

Write `docs/blueprint/reports/report_034.md` (status `READY_FOR_REVIEW`) with the command output
counts, the chosen Playwright version, any selector you had to adjust and why, and any deviation
from this task. Then stop.
