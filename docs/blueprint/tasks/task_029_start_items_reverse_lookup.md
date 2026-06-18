# TASK 029: Character starting items + reverse lookup ("kdo s ním startuje")

> **Status:** DONE (commit b623c72)
> **Assigned to:** Constructor (Sonnet sub-agent)

## 1. Goal

Add a structured `startItems` field to characters (the glossary ids of items a character
**possesses at game start**) and surface a **reverse lookup** on the item's glossary term-sheet:
"Startuje s ním: Pirátka (Okolní vesmír), Plukovník, Strážce (3D tiskárna)". This answers the
table question *"who starts with a weapon, and where?"* — the forward data lived only in free-text
`setup` until now.

> The Architect already authored `startItems` on 9 characters in `src/data/characters.json`
> (e.g. `piratka` → `["helma","pistole","hasak"]`). **DO NOT edit `src/data/characters.json`** or any
> other file under `src/data/*.json`.

Authored mapping (for reference only — already in the data):
`hasak` → Drony, Opravářka, Pirátka · `helma` → Kryospáčka, Pirátka ·
`pistole` → Pirátka, Plukovník, Strážce · `tajemstvi-x` → obě Doktorky · `uplatek` → Miliardář.

## 2. Files

- Modify: `src/data/schema.ts` (add `startItems?` to `Character`)
- Modify: `src/data/schemas.ts` (add `startItems` to `characterSchema`, before `.strict()`)
- Create: `src/lib/start-items.ts` (reverse index) + `src/lib/__tests__/start-items.test.ts`
- Modify: `src/components/term-sheet.tsx` (render "Startuje s ním" in the glossary branch)
- Modify: `src/components/__tests__/term-sheet.test.tsx` (assert the reverse lookup renders)
- Modify: `src/data/__tests__/data.integrity.test.ts` (validate `startItems` → glossary ids)

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  `src/lib/__tests__/start-items.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { charactersStartingWith } from "@/lib/start-items";

  describe("charactersStartingWith", () => {
    it("returns every character that starts possessing the item", () => {
      const ids = charactersStartingWith("pistole").map((c) => c.id);
      expect(ids).toEqual(expect.arrayContaining(["piratka", "plukovnik", "strazce"]));
      expect(ids).toHaveLength(3);
    });
    it("returns empty for an item nobody starts with", () => {
      expect(charactersStartingWith("antihmota")).toEqual([]);
    });
  });
  ```

  Append to `src/components/__tests__/term-sheet.test.tsx` (inside the existing `describe`):
  ```tsx
  it("lists characters who start with the item (reverse lookup)", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Pistole" }));
    const dialog = screen.getByRole("dialog", { name: "Pistole" });
    expect(within(dialog).getByText("Startuje s ním")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Pirátka/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Strážce/ })).toBeInTheDocument();
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/start-items` does not exist; the term-sheet has no "Startuje s ním" block.

- [ ] **Add `startItems` to `src/data/schema.ts`** — in `Character`, right after `startSection`:
  ```ts
  /** Glosářová id předmětů, které postava vlastní na začátku hry (reverzní lookup). */
  startItems?: string[];
  ```

- [ ] **Add `startItems` to `src/data/schemas.ts`** — in `characterSchema`, after `startSection`
  (before `.strict()`):
  ```ts
  startItems: z.array(z.string()).optional(),
  ```

- [ ] **Implement `src/lib/start-items.ts`** (build the index once at module load):
  ```ts
  import { characters, type Character } from "@/data";

  const index = new Map<string, Character[]>();
  for (const c of characters) {
    for (const id of c.startItems ?? []) {
      const list = index.get(id) ?? [];
      list.push(c);
      index.set(id, list);
    }
  }

  /** Postavy, které začínají hru s daným předmětem (glosářové id). */
  export function charactersStartingWith(itemId: string): Character[] {
    return index.get(itemId) ?? [];
  }
  ```

- [ ] **Render the reverse lookup in `src/components/term-sheet.tsx`** (glossary branch).
  Add the import at the top:
  ```ts
  import { charactersStartingWith } from "@/lib/start-items";
  ```
  In the glossary branch (`term !== null`), insert the block right **after** the existing
  "Objevuje se u" (`relatedCharacterIds`) block:
  ```tsx
  {charactersStartingWith(term.id).length > 0 ? (
    <div className="mt-3">
      <p className="text-xs font-semibold text-zinc-500">Startuje s ním</p>
      <div className="flex flex-wrap gap-2">
        {charactersStartingWith(term.id).map((sc) => (
          <Link
            key={sc.id}
            href={`/postavy/${sc.id}`}
            onClick={close}
            className="text-sm underline"
          >
            {sc.nameCs}
            {sc.startSection ? ` (${sc.startSection})` : ""}
          </Link>
        ))}
      </div>
    </div>
  ) : null}
  ```
  (`Link` and `close` are already in scope in this component.)

- [ ] **Validate `startItems` in `src/data/__tests__/data.integrity.test.ts`** — add a new `it`
  inside the `describe("data integrity", …)` block:
  ```ts
  it("every character startItems id resolves to a glossary id", () => {
    const bad: string[] = [];
    for (const c of characters)
      for (const it of c.startItems ?? [])
        if (!glossaryIds.has(it)) bad.push(`${c.id} -> ${it}`);
    expect(bad).toEqual([]);
  });
  ```
  (`characters` and `glossaryIds` are already imported in this file.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — reverse index returns the 3 pistol carriers; opening "Pistole" shows the
  "Startuje s ním" links; every `startItems` id resolves; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. On the Pistole / Helma / Hasák / Tajemství X / Úplatek
  term-sheets the "Startuje s ním" list appears; other terms show nothing new.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. **Do not edit any `src/data/*.json` file.**
- No import cycle: `start-items.ts` imports only from `@/data` (same as `src/lib/faq.ts`).
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (charactersStartingWith; term-sheet reverse-lookup render; startItems integrity;
   all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Item glossary term-sheets (Pistole, Helma, Hasák, Tajemství X, Úplatek) show a "Startuje s ním"
   list of characters with their start section; `Character` carries optional `startItems`.
4. Report written to `docs/blueprint/reports/report_029.md`.
