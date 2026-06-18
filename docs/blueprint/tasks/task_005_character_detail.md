# TASK 005: Character detail (dossier)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Render a full character "dossier" at `/postavy/[id]` (statically generated for all 28 characters):
collapsible sections for abilities, reveal abilities, agendas (with point breakdown), bonus points,
edge cases, tips and setup, with category-colored ability chips.

## 2. Files

- Create: `src/components/character-dossier.tsx` + `src/components/__tests__/character-dossier.test.tsx`
- Create: `src/app/postavy/[id]/page.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/components/__tests__/character-dossier.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { characters } from "@/data";
  import { CharacterDossier } from "@/components/character-dossier";

  function fixture(id: string) {
    const c = characters.find((x) => x.id === id);
    if (!c) throw new Error(`fixture ${id} missing`);
    return c;
  }

  describe("CharacterDossier", () => {
    it("renders the character header and abilities", () => {
      render(<CharacterDossier character={fixture("agentka")} />);
      expect(screen.getByRole("heading", { name: "Agentka" })).toBeInTheDocument();
      expect(screen.getByText("Důstojník")).toBeInTheDocument();
      expect(screen.getByText("Granáty s nervovým plynem")).toBeInTheDocument(); // reveal ability
    });

    it("renders agendas (title + points) and edge cases", () => {
      render(<CharacterDossier character={fixture("agentka")} />);
      expect(screen.getByText("ZAMETENÍ DŮKAZŮ")).toBeInTheDocument();
      expect(screen.getByText(/Mina nereaguje na Entropický přízrak/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/character-dossier` does not exist.

- [ ] **Implement `src/components/character-dossier.tsx`** (complete, no placeholders):
  ```tsx
  import type { ReactNode } from "react";
  import type { Character } from "@/data";
  import { CATEGORY_BG_CLASS, CATEGORY_LABEL, TYPE_LABEL } from "@/lib/categories";

  type Ability = Character["abilities"][number];

  function AbilityRow({ ability }: { ability: Ability }) {
    return (
      <div className="py-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[ability.category]}`}
          >
            {CATEGORY_LABEL[ability.category]}
          </span>
          <span className="font-medium">{ability.name}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{ability.text}</p>
      </div>
    );
  }

  function Section({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
    return (
      <details open={open} className="border-b border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer py-3 font-semibold">{title}</summary>
        <div className="pb-4">{children}</div>
      </details>
    );
  }

  export function CharacterDossier({ character: c }: { character: Character }) {
    return (
      <article className="p-4">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold">{c.nameCs}</h1>
          <p className="text-sm text-zinc-500">
            {TYPE_LABEL[c.type]} · Limit vlivu {c.influenceLimit} · {c.address}
          </p>
        </header>

        <Section title="Schopnosti" open>
          {c.abilities.map((a) => (
            <AbilityRow key={a.name} ability={a} />
          ))}
        </Section>

        {c.revealAbilities.length > 0 && (
          <Section title="Po odhalení">
            {c.revealAbilities.map((a) => (
              <AbilityRow key={a.name} ability={a} />
            ))}
          </Section>
        )}

        <Section title="Úkoly">
          {c.agendaTitle ? <p className="mb-2 font-medium">{c.agendaTitle}</p> : null}
          <ul className="space-y-1">
            {c.agendas.map((ag, i) => (
              <li key={i} className={ag.isPlus ? "ml-4" : ""}>
                <span className="font-semibold">
                  {ag.isPlus ? "+" : "•"} {ag.points} b
                </span>{" "}
                — {ag.text}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Bonusové body">
          <p className="text-sm">{c.bonusPoints}</p>
        </Section>

        {c.edgeCases.length > 0 && (
          <Section title="Zvláštnosti">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {c.edgeCases.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </Section>
        )}

        {c.tips.length > 0 && (
          <Section title="Tipy">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {c.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Příprava hry">
          <p className="text-sm">{c.setup}</p>
        </Section>
      </article>
    );
  }
  ```

- [ ] **Implement `src/app/postavy/[id]/page.tsx`** (static params for all 28; Next 16 async params):
  ```tsx
  import { notFound } from "next/navigation";
  import { characters } from "@/data";
  import { CharacterDossier } from "@/components/character-dossier";

  export function generateStaticParams() {
    return characters.map((c) => ({ id: c.id }));
  }

  export default async function CharacterDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const character = characters.find((c) => c.id === id);
    if (!character) notFound();
    return (
      <main>
        <CharacterDossier character={character} />
      </main>
    );
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — dossier renders header, abilities, reveal abilities, agenda title, edge cases.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build statically exports all 28 `/postavy/<id>` pages
  (e.g. `out/postavy/agentka.html` exists).

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data files / `src/data/*` / `categories.ts`.
- `notFound()` is typed `never` — no non-null assertion needed after the guard.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (dossier header, abilities, reveal abilities, agendas, edge cases).
2. `pnpm lint` zero warnings; `pnpm build` exports 28 static `/postavy/<id>` pages.
3. Sections are collapsible (`<details>`); "Schopnosti" open by default; ability chips colored by category.
4. Report written to `docs/blueprint/reports/report_005.md`.
