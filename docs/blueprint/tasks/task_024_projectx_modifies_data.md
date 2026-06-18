# TASK 024: Project X "modifies" — schema + reverse index

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Wire the authored `projectsX[].modifies` mapping (which rules/characters each Project X changes) into
the schema with validation, and expose a reverse index (target id → the Projects X that modify it).

## 2. Files

- Modify: `src/data/schema.ts` (add `modifies` to `ProjectX`)
- Modify: `src/data/schemas.ts` (add `modifies` to `projectXSchema`)
- Create: `src/lib/project-x.ts` (reverse index) + `src/lib/__tests__/project-x.test.ts`
- Modify: `src/data/__tests__/data.integrity.test.ts` (modifies targets resolve)

> `src/data/projectsX.json` already contains the authored `modifies` data — DO NOT edit it.

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  `src/lib/__tests__/project-x.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { projectsModifying } from "@/lib/project-x";

  describe("projectsModifying", () => {
    it("returns the Projects X that modify a target", () => {
      expect(projectsModifying("podezrely").some((m) => m.projectX.id === "bojove-hejno")).toBe(true);
      expect(projectsModifying("botanik").some((m) => m.projectX.id === "masozravy-bioexperiment")).toBe(true);
    });
    it("returns empty for an unmodified target", () => {
      expect(projectsModifying("nonexistent-xyz")).toEqual([]);
    });
  });
  ```

  Append to `src/data/__tests__/data.integrity.test.ts` (uses existing `projectsX`, `glossaryIds`,
  `characterIds` imports):
  ```ts
  it("every Project X 'modifies' target resolves", () => {
    const bad: string[] = [];
    for (const px of projectsX)
      for (const m of px.modifies ?? []) {
        const ok = m.targetKind === "glossary" ? glossaryIds.has(m.targetId) : characterIds.has(m.targetId);
        if (!ok) bad.push(`${px.id} -> ${m.targetId}`);
      }
    expect(bad).toEqual([]);
  });
  ```
  (If `projectsX` / `characterIds` are not yet imported in this file, add them to the `@/data` import.)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/project-x` missing; integrity test references `modifies` (still parses, but
  the lib import fails the suite).

- [ ] **Add `modifies` to `src/data/schema.ts`** — in the `ProjectX` interface:
  ```ts
  /** Pravidla/postavy, které tento Projekt X mění (pro statické cross-link varování). */
  modifies?: { targetId: string; targetKind: "glossary" | "character"; note: string }[];
  ```

- [ ] **Add `modifies` to `src/data/schemas.ts`** — in `projectXSchema` (before `.strict()`):
  ```ts
  modifies: z
    .array(
      z
        .object({
          targetId: z.string(),
          targetKind: z.enum(["glossary", "character"]),
          note: z.string(),
        })
        .strict(),
    )
    .optional(),
  ```

- [ ] **Implement `src/lib/project-x.ts`**:
  ```ts
  import { projectsX, type ProjectX } from "@/data";

  export type ProjectXModifier = { projectX: ProjectX; note: string };

  const index = new Map<string, ProjectXModifier[]>();
  for (const px of projectsX) {
    for (const m of px.modifies ?? []) {
      const list = index.get(m.targetId) ?? [];
      list.push({ projectX: px, note: m.note });
      index.set(m.targetId, list);
    }
  }

  export function projectsModifying(targetId: string): ProjectXModifier[] {
    return index.get(targetId) ?? [];
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — reverse index returns modifiers; every modifies target resolves; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit data files (the `modifies` data is authored).
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (reverse index + modifies targets resolve; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. `projectsModifying(id)` exported; `ProjectX.modifies` typed + Zod-validated at load.
4. Report written to `docs/blueprint/reports/report_024.md`.
