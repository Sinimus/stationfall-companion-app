# TASK 025: Project X cross-link warnings (UI)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Surface the static Project X cross-links: a ⚠ warning on a modified glossary term (in the sheet) and
character (in the dossier), and a "Modifikuje" forward list on the Project X card. Warnings open the
Project X card in the bottom-sheet.

## 2. Files

- Create: `src/components/project-x-warning.tsx` + `src/components/__tests__/project-x-warning.test.tsx`
- Create: `src/components/project-x-modifies.tsx`
- Modify: `src/components/term-sheet.tsx` (render warning in the glossary branch)
- Modify: `src/components/character-dossier.tsx` (render warning under the header)
- Modify: `src/components/project-x-list.tsx` (render the "Modifikuje" forward list)

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/components/__tests__/project-x-warning.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { ProjectXWarning } from "@/components/project-x-warning";

  describe("ProjectXWarning", () => {
    it("warns about a modifying Project X and opens its card", async () => {
      const user = userEvent.setup();
      render(
        <TermSheetProvider>
          <ProjectXWarning targetId="podezrely" />
        </TermSheetProvider>,
      );
      const btn = screen.getByRole("button", { name: "Bojové hejno" });
      await user.click(btn);
      expect(screen.getByRole("dialog", { name: "Bojové hejno" })).toBeInTheDocument();
    });

    it("renders nothing when the target is not modified", () => {
      render(
        <TermSheetProvider>
          <ProjectXWarning targetId="konspirator" />
        </TermSheetProvider>,
      );
      expect(screen.queryByText(/Modifikováno Projektem X/)).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/project-x-warning` does not exist.

- [ ] **Implement `src/components/project-x-warning.tsx`** (client; imports the hook from the context
  module to avoid the term-sheet import cycle):
  ```tsx
  "use client";

  import { useTermSheet } from "@/components/term-sheet-context";
  import { projectsModifying } from "@/lib/project-x";

  export function ProjectXWarning({ targetId }: { targetId: string }) {
    const { openProject } = useTermSheet();
    const modifiers = projectsModifying(targetId);
    if (modifiers.length === 0) return null;
    return (
      <div className="mt-3 space-y-1 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm dark:border-amber-700 dark:bg-amber-950/40">
        {modifiers.map(({ projectX, note }) => (
          <p key={projectX.id}>
            ⚠ Modifikováno Projektem X:{" "}
            <button
              type="button"
              onClick={() => openProject(projectX.id)}
              className="font-medium underline"
            >
              {projectX.nameCs}
            </button>{" "}
            — {note}
          </p>
        ))}
      </div>
    );
  }
  ```

- [ ] **Implement `src/components/project-x-modifies.tsx`** (client; forward "Modifikuje" list):
  ```tsx
  "use client";

  import Link from "next/link";
  import type { ProjectX } from "@/data";
  import { useTermSheet } from "@/components/term-sheet-context";
  import { glossaryById, characterNameById } from "@/lib/lookups";

  export function ProjectXModifies({ project }: { project: ProjectX }) {
    const { openTerm } = useTermSheet();
    if (!project.modifies || project.modifies.length === 0) return null;
    return (
      <div className="mt-2">
        <p className="text-xs font-semibold text-zinc-500">Modifikuje</p>
        <ul className="space-y-0.5 text-sm">
          {project.modifies.map((m, i) => (
            <li key={i}>
              {m.targetKind === "glossary" ? (
                <button type="button" onClick={() => openTerm(m.targetId)} className="underline">
                  {glossaryById.get(m.targetId)?.nameCs ?? m.targetId}
                </button>
              ) : (
                <Link href={`/postavy/${m.targetId}`} className="underline">
                  {characterNameById.get(m.targetId) ?? m.targetId}
                </Link>
              )}{" "}
              — {m.note}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  ```

- [ ] **Wire into `src/components/term-sheet.tsx`** — in the glossary branch (`term !== null`), after the
  `ruleRefs` paragraph and still inside that fragment, add:
  ```tsx
  <ProjectXWarning targetId={term.id} />
  ```
  Add `import { ProjectXWarning } from "@/components/project-x-warning";`.

- [ ] **Wire into `src/components/character-dossier.tsx`** — render right after the `</header>`:
  ```tsx
  <ProjectXWarning targetId={c.id} />
  ```
  Add `import { ProjectXWarning } from "@/components/project-x-warning";`.

- [ ] **Wire into `src/components/project-x-list.tsx`** — inside each `<details>` content, after the
  trigger paragraph, add:
  ```tsx
  <ProjectXModifies project={p} />
  ```
  Add `import { ProjectXModifies } from "@/components/project-x-modifies";`. (Use the actual map
  variable name for the project in that file.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — warning shows + opens the card; nothing for unmodified targets; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. A built glossary/character page that is modified shows
  the ⚠ block (e.g. the Botanist page references "Masožravý bioexperiment").

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*`.
- `ProjectXWarning` / `ProjectXModifies` must import `useTermSheet` from `@/components/term-sheet-context`
  (NOT `@/components/term-sheet`) to avoid a circular import.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (warning shows + opens card, empty for unmodified, all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports all routes.
3. Modified glossary terms (sheet) and characters (dossier) show the ⚠ Project X warning; Project X
   cards show a "Modifikuje" list; all open/link correctly.
4. Report written to `docs/blueprint/reports/report_025.md`.
