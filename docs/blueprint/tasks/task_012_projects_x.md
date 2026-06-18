# TASK 012: Project X cards UI + search indexing

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Surface the 8 Project X cards (currently in data but rendered nowhere): an expandable section on
`/pruvodci`, and index them in global search.

## 2. Files

- Create: `src/components/project-x-list.tsx` + `src/components/__tests__/project-x-list.test.tsx`
- Modify: `src/app/pruvodci/page.tsx` (add "Projekty X" section)
- Modify: `src/lib/search.ts` (index `projectsX`) + `src/lib/__tests__/search.test.ts`
- Modify: `src/app/hledat/page.tsx` (label + routing for the new result type)

## 3. Implementation Steps (TDD)

- [ ] **Write failing tests**

  `src/components/__tests__/project-x-list.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { projectsX } from "@/data";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { ProjectXList } from "@/components/project-x-list";

  describe("ProjectXList", () => {
    it("renders project names", () => {
      render(
        <TermSheetProvider>
          <ProjectXList projects={projectsX} />
        </TermSheetProvider>,
      );
      expect(screen.getByText("Bojové hejno")).toBeInTheDocument();
      expect(screen.getByText("Paprsek smrti")).toBeInTheDocument();
    });
  });
  ```

  Append to `src/lib/__tests__/search.test.ts`:
  ```ts
  it("finds a Project X card", () => {
    expect(search("hejno").some((r) => r.type === "projectx")).toBe(true);
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/project-x-list` missing; `"projectx"` not a result type.

- [ ] **Implement `src/components/project-x-list.tsx`** (complete, no placeholders):
  ```tsx
  import type { ProjectX } from "@/data";
  import { RuleText } from "@/components/rule-text";

  export function ProjectXList({ projects }: { projects: ProjectX[] }) {
    return (
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id}>
            <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <summary className="cursor-pointer font-medium">{p.nameCs}</summary>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  <RuleText>{p.text}</RuleText>
                </p>
                {p.trigger ? (
                  <p className="text-xs text-zinc-500">
                    Spuštění: <RuleText>{p.trigger}</RuleText>
                  </p>
                ) : null}
              </div>
            </details>
          </li>
        ))}
      </ul>
    );
  }
  ```

- [ ] **Add the section to `src/app/pruvodci/page.tsx`** — import `projectsX` and `ProjectXList`,
  and after the Q&A section add:
  ```tsx
  <section aria-label="Projekty X">
    <h2 className="mb-1 text-sm font-semibold text-zinc-500">Projekty X</h2>
    <ProjectXList projects={projectsX} />
  </section>
  ```

- [ ] **Index Project X in `src/lib/search.ts`**:
  - Add `"projectx"` to the `ResultType` union.
  - Import `projectsX` (extend the existing `@/data` import).
  - After the flows loop, add:
    ```ts
    for (const p of projectsX) add("projectx", p.id, p.nameCs, `${p.text} ${p.trigger ?? ""}`);
    ```

- [ ] **Handle the new type in `src/app/hledat/page.tsx`**:
  - In `TYPE_LABEL` add `projectx: "Projekt X"`.
  - In `hrefFor`, Project X routes to `/pruvodci` (same as faq) — i.e. the existing fallback
    `return "/pruvodci";` already covers it; ensure `projectx` is NOT treated as character/flow.

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — project names render; search finds a Project X card; all prior suites green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; `/pruvodci` exports including the 8 Project X cards.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `as string`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet.tsx`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (Project X names render; search finds a Project X; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` with the 8 Project X cards.
3. Project X text/trigger route through `RuleText` (keywords tappable); global search returns Project X results.
4. Report written to `docs/blueprint/reports/report_012.md`.
