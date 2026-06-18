# TASK 001: Project skeleton, tooling & data module

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Initialize a Next.js App Router static-export skeleton (TS strict, Tailwind v4, Vitest), move the
existing `data/` content into `src/data/`, and prove it loads with a passing data smoke test.

## 2. Files

- Create (scaffold): `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `src/data/__tests__/data.smoke.test.ts`
- Move (git mv): `data/{characters,glossary,flows,projectsX,faq}.json`, `data/schema.ts`,
  `data/README.md` → `src/data/`
- Keep in place: `src/data/_sources/processed-threads.json` (dev tooling, not bundled)

> Note: the project root already contains `.git`, `data/`, `docs/`, `.kilo/`, `.claude/`.
> `create-next-app` refuses a non-empty dir, so scaffold in a temp sibling dir and move files in
> (excluding its `.git`, `node_modules`, `README.md`, `.gitignore`).

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/data/__tests__/data.smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import characters from "@/data/characters.json";
import glossary from "@/data/glossary.json";
import flows from "@/data/flows.json";
import projectsX from "@/data/projectsX.json";
import faq from "@/data/faq.json";

describe("data package loads", () => {
  it("has the expected record counts", () => {
    expect(characters).toHaveLength(28);
    expect(glossary).toHaveLength(109);
    expect(flows).toHaveLength(4);
    expect(projectsX).toHaveLength(8);
    expect(faq).toHaveLength(31);
  });

  it("every character has a non-empty id and nameCs", () => {
    for (const c of characters) {
      expect(c.id).toBeTruthy();
      expect(c.nameCs).toBeTruthy();
    }
  });
});
```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — module `@/data/characters.json` cannot be resolved (project not scaffolded yet).

- [ ] **Implement minimal solution**

  1. Scaffold into a temp dir and merge into the project root:
     ```bash
     cd ..
     pnpm create next-app@latest sf-scaffold \
       --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
     # move generated files into the project (do NOT overwrite existing data/, docs/, .git)
     rsync -a --exclude '.git' --exclude 'node_modules' --exclude 'README.md' --exclude '.gitignore' \
       sf-scaffold/ stationfall-companion-app/
     rm -rf sf-scaffold
     cd stationfall-companion-app
     pnpm install
     ```
  2. Move data into `src/data/`:
     ```bash
     git mv data/characters.json data/glossary.json data/flows.json data/projectsX.json \
       data/faq.json data/schema.ts data/README.md src/data/
     ```
  3. Add Vitest tooling:
     ```bash
     pnpm add -D vitest vite-tsconfig-paths
     ```
  4. Create `vitest.config.ts`:
     ```ts
     import { defineConfig } from "vitest/config";
     import tsconfigPaths from "vite-tsconfig-paths";

     export default defineConfig({
       plugins: [tsconfigPaths()],
       test: { environment: "node", globals: false },
     });
     ```
  5. Set `next.config.ts` for static export (replace generated contents):
     ```ts
     import type { NextConfig } from "next";

     const nextConfig: NextConfig = {
       output: "export",
       images: { unoptimized: true },
     };

     export default nextConfig;
     ```
  6. In `tsconfig.json` ensure: `"strict": true`, `"resolveJsonModule": true`, and the path alias
     `"@/*": ["./src/*"]` (create-next-app sets these; verify, do not regress).
  7. Add scripts to `package.json`:
     ```json
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "lint": "next lint",
       "test": "vitest run",
       "test:watch": "vitest"
     }
     ```
  8. Replace `src/app/page.tsx` with a minimal placeholder (no boilerplate marketing markup):
     ```tsx
     export default function Home() {
       return <main className="p-6 text-lg">Stationfall Companion — skeleton</main>;
     }
     ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — both tests green (counts: 28/109/4/8/31).

- [ ] **Verify static build**
  Run: `pnpm build`
  Expected: PASS — produces a static `out/` directory (App Router export).

- [ ] **Run linter**
  Run: `pnpm lint`
  Expected: zero warnings/errors.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, no `as any`, no `@ts-ignore`. Tailwind v4 (generated default), pnpm only.
- Do not delete or edit any file under `data/_sources/`, `docs/`, `.kilo/`, `.claude/`.
- Do not alter the contents of the moved JSON/`schema.ts` data files — move only.

## 5. Acceptance Criteria

1. `pnpm test` passes (data smoke test, correct counts).
2. `pnpm build` produces a static `out/` export.
3. `pnpm lint` passes with zero warnings.
4. Data files live under `src/data/`; `data/_sources/` untouched.
5. Report written to `docs/blueprint/reports/report_001.md`.
