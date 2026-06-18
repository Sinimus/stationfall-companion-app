# TASK 004: Characters list + filters

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Render the 28 characters on `/postavy` as a tappable, cs-sorted grid with client-side filters by
character type and by ability category.

## 2. Files

- Modify: `src/lib/categories.ts` (add character-type label/list helpers)
- Create: `src/components/character-list.tsx` + `src/components/__tests__/character-list.test.tsx`
- Modify: `src/app/postavy/page.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Extend `src/lib/categories.ts`** — append (keep existing exports):
  ```ts
  export type CharacterType = Character["type"];

  export const CHARACTER_TYPES = [
    "clovek",
    "robot",
    "data",
    "predmet",
  ] as const satisfies readonly CharacterType[];

  export const TYPE_LABEL: Record<CharacterType, string> = {
    clovek: "Člověk",
    robot: "Robot",
    data: "Data",
    predmet: "Předmět",
  };
  ```

- [ ] **Write failing test** — `src/components/__tests__/character-list.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { characters } from "@/data";
  import { CharacterList } from "@/components/character-list";

  describe("CharacterList", () => {
    it("lists all characters as links", () => {
      render(<CharacterList characters={characters} />);
      expect(screen.getAllByRole("link")).toHaveLength(28);
    });

    it("filters by character type (Robot → 5 robots)", async () => {
      const user = userEvent.setup();
      render(<CharacterList characters={characters} />);
      await user.click(screen.getByRole("button", { name: "Robot" }));
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(5);
      expect(screen.getByRole("link", { name: /Strážce/ })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Agentka/ })).not.toBeInTheDocument();
    });

    it("filters by ability category and can reset", async () => {
      const user = userEvent.setup();
      render(<CharacterList characters={characters} />);
      await user.click(screen.getByRole("button", { name: "Konspirační" }));
      const filtered = screen.getAllByRole("link").length;
      expect(filtered).toBeGreaterThan(0);
      expect(filtered).toBeLessThan(28);
      // toggling off restores the full list
      await user.click(screen.getByRole("button", { name: "Konspirační" }));
      expect(screen.getAllByRole("link")).toHaveLength(28);
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/character-list` does not exist.

- [ ] **Implement `src/components/character-list.tsx`** (complete, no placeholders):
  ```tsx
  "use client";

  import { useState } from "react";
  import Link from "next/link";
  import type { Character } from "@/data";
  import {
    ABILITY_CATEGORIES,
    CATEGORY_LABEL,
    CATEGORY_BG_CLASS,
    CHARACTER_TYPES,
    TYPE_LABEL,
    type AbilityCategory,
    type CharacterType,
  } from "@/lib/categories";

  function hasCategory(c: Character, cat: AbilityCategory): boolean {
    return [...c.abilities, ...c.revealAbilities].some((a) => a.category === cat);
  }

  export function CharacterList({ characters }: { characters: Character[] }) {
    const [type, setType] = useState<CharacterType | null>(null);
    const [category, setCategory] = useState<AbilityCategory | null>(null);

    const visible = characters.filter((c) => {
      if (type !== null && c.type !== type) return false;
      if (category !== null && !hasCategory(c, category)) return false;
      return true;
    });

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" aria-label="Filtr podle typu">
          {CHARACTER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(type === t ? null : t)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Filtr podle kategorie schopnosti">
          {ABILITY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? null : c)}
              className={`rounded-full px-3 py-1 text-sm text-white opacity-60 aria-pressed:opacity-100 ${CATEGORY_BG_CLASS[c]}`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/postavy/${c.id}`}
                className="flex flex-col rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
              >
                <span className="font-medium">{c.nameCs}</span>
                <span className="text-xs text-zinc-500">{TYPE_LABEL[c.type]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  ```

- [ ] **Wire `src/app/postavy/page.tsx`** (cs-sorted; fixes Č/Ú ordering):
  ```tsx
  import { characters } from "@/data";
  import { CharacterList } from "@/components/character-list";

  export default function PostavyPage() {
    const sorted = [...characters].sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
    return (
      <main className="p-4">
        <h1 className="sr-only">Postavy</h1>
        <CharacterList characters={sorted} />
      </main>
    );
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — list renders 28, Robot filter → 5, category filter narrows and resets.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; `/postavy` still exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data files / `src/data/*`.
- Keep all existing tests passing. Links point to `/postavy/[id]` (detail route lands in task 005;
  navigation target may 404 until then — acceptable for this task).
- If the Robot count assertion is wrong, the data is authoritative — report the real count; do not
  edit data. (Expected robots: Drony, Medik, Právník, Společník, Strážce = 5.)

## 5. Acceptance Criteria

1. `pnpm test` passes (list count, type filter, category filter + reset).
2. `pnpm lint` zero warnings; `pnpm build` exports `/postavy`.
3. Grid is cs-sorted; filters toggle (type single-select, category single-select, tap-again clears).
4. Report written to `docs/blueprint/reports/report_004.md`.
