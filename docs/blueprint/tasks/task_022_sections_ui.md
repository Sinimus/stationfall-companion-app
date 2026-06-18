# TASK 022: Sections UI — 5th tab, list & detail

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Add a 5th "Sekce" tab: `/sekce` lists the 41 sections grouped by zone with property filters, and
`/sekce/[id]` (statically generated) shows a section's properties + "what you can do here" (actions
link into the glossary sheet) + notes.

## 2. Files

- Create: `src/lib/sections.ts`
- Modify: `src/components/bottom-nav.tsx` (+ `src/components/__tests__/bottom-nav.test.tsx`)
- Create: `src/components/section-list.tsx` + `src/components/__tests__/section-list.test.tsx`
- Create: `src/components/section-actions.tsx`, `src/components/section-detail.tsx` + `src/components/__tests__/section-detail.test.tsx`
- Create: `src/app/sekce/page.tsx`, `src/app/sekce/[id]/page.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Implement `src/lib/sections.ts`**:
  ```ts
  import { sections, type Section } from "@/data";

  export const sectionById = new Map<string, Section>(sections.map((s) => [s.id, s]));

  export type SectionZone = Section["zone"];

  export const ZONE_ORDER = [
    "horni-prstenec",
    "dolni-prstenec",
    "centralni-osa",
    "unikovy-modul",
    "specialni",
  ] as const satisfies readonly SectionZone[];

  export const ZONE_LABEL: Record<SectionZone, string> = {
    "horni-prstenec": "Horní prstenec",
    "dolni-prstenec": "Dolní prstenec",
    "centralni-osa": "Centrální osa",
    "unikovy-modul": "Únikové moduly",
    specialni: "Speciální sekce",
  };

  export const GRAVITY_LABEL: Record<Section["gravity"], string> = {
    gravitace: "Gravitace",
    nulova: "Nulová gravitace",
  };
  ```

- [ ] **Write failing tests**

  `src/components/__tests__/section-list.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { sections } from "@/data";
  import { SectionList } from "@/components/section-list";

  describe("SectionList", () => {
    it("lists all sections as links", () => {
      render(<SectionList sections={sections} />);
      expect(screen.getAllByRole("link")).toHaveLength(41);
    });
    it("filters to dark sections", async () => {
      const user = userEvent.setup();
      render(<SectionList sections={sections} />);
      await user.click(screen.getByRole("button", { name: "Temná" }));
      expect(screen.getAllByRole("link")).toHaveLength(7);
    });
  });
  ```

  `src/components/__tests__/section-detail.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { sections } from "@/data";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { SectionDetail } from "@/components/section-detail";

  function fixture(id: string) {
    const s = sections.find((x) => x.id === id);
    if (!s) throw new Error(`section ${id} missing`);
    return s;
  }

  describe("SectionDetail", () => {
    it("renders header and actions for the Security Station", () => {
      render(
        <TermSheetProvider>
          <SectionDetail section={fixture("bezpecnostni-stanice")} />
        </TermSheetProvider>,
      );
      expect(screen.getByRole("heading", { name: "Bezpečnostní stanice" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Výroba" })).toBeInTheDocument();
    });
  });
  ```

  Update `src/components/__tests__/bottom-nav.test.tsx`: the destinations are now five and include
  "Sekce":
  ```tsx
  it("renders the five destinations", () => {
    render(<BottomNav />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    for (const label of ["Postavy", "Glosář", "Průvodci", "Sekce", "Hledat"]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
    }
  });
  ```
  (Rename the existing "four destinations" test accordingly.)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `section-list` / `section-detail` missing; bottom-nav has 4 links.

- [ ] **Add the 5th nav item in `src/components/bottom-nav.tsx`**:
  - Import: `import { Users, BookOpen, Route, Map as MapIcon, Search } from "lucide-react";`
  - Insert before the Hledat item: `{ href: "/sekce", label: "Sekce", Icon: MapIcon },`
  - Change the nav container class `grid-cols-4` → `grid-cols-5`.

- [ ] **Implement `src/components/section-list.tsx`** (complete):
  ```tsx
  "use client";

  import { useState } from "react";
  import Link from "next/link";
  import type { Section } from "@/data";
  import { ZONE_ORDER, ZONE_LABEL, GRAVITY_LABEL } from "@/lib/sections";

  type PropFilter = "lit" | "powered" | "consolePanel";

  const PROP_FILTERS: { key: PropFilter; label: string }[] = [
    { key: "lit", label: "Temná" },
    { key: "powered", label: "Napájecí" },
    { key: "consolePanel", label: "Ovládací panel" },
  ];

  export function SectionList({ sections }: { sections: Section[] }) {
    const [active, setActive] = useState<ReadonlySet<PropFilter>>(new Set());

    function toggle(key: PropFilter) {
      setActive((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }

    function pass(s: Section): boolean {
      if (active.has("lit") && s.lit !== false) return false;
      if (active.has("powered") && s.powered !== true) return false;
      if (active.has("consolePanel") && s.consolePanel !== true) return false;
      return true;
    }

    const visible = sections.filter(pass);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Filtr sekcí">
          {PROP_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={active.has(key)}
              onClick={() => toggle(key)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
            >
              {label}
            </button>
          ))}
        </div>

        {ZONE_ORDER.map((zone) => {
          const group = visible
            .filter((s) => s.zone === zone)
            .sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
          if (group.length === 0) return null;
          return (
            <section key={zone} aria-label={ZONE_LABEL[zone]}>
              <h2 className="mb-1 text-sm font-semibold text-zinc-500">{ZONE_LABEL[zone]}</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/sekce/${s.id}`}
                      className="flex flex-col rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                    >
                      <span className="font-medium">{s.nameCs}</span>
                      <span className="text-xs text-zinc-500">
                        {GRAVITY_LABEL[s.gravity]}
                        {s.lit === false ? " · temná" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Implement `src/components/section-actions.tsx`** (client; actions open the glossary sheet):
  ```tsx
  "use client";

  import { useTermSheet } from "@/components/term-sheet";
  import { glossaryById } from "@/lib/lookups";

  export function SectionActions({ actionIds }: { actionIds: string[] }) {
    const { openTerm } = useTermSheet();
    if (actionIds.length === 0) {
      return <p className="text-sm text-zinc-500">Žádná zvláštní akce sekce.</p>;
    }
    return (
      <ul className="flex flex-wrap gap-2">
        {actionIds.map((id) => {
          const term = glossaryById.get(id);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => openTerm(id)}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm dark:border-zinc-800"
              >
                {term !== undefined ? term.nameCs : id}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  ```

- [ ] **Implement `src/components/section-detail.tsx`** (complete):
  ```tsx
  import type { Section } from "@/data";
  import { ZONE_LABEL, GRAVITY_LABEL } from "@/lib/sections";
  import { RuleText } from "@/components/rule-text";
  import { SectionActions } from "@/components/section-actions";

  export function SectionDetail({ section: s }: { section: Section }) {
    return (
      <article className="space-y-4 p-4">
        <header>
          <h1 className="text-2xl font-semibold">{s.nameCs}</h1>
          <p className="text-sm text-zinc-500">
            {ZONE_LABEL[s.zone]} · {GRAVITY_LABEL[s.gravity]}
            {s.lit === false ? " · temná (bez kamer)" : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {s.powered ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">Napájecí sekce</span>
            ) : null}
            {s.consolePanel ? (
              <span className="rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900/40">Ovládací panel</span>
            ) : null}
            {s.escapePod ? (
              <span className="rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/40">Únikový modul</span>
            ) : null}
          </div>
        </header>

        <section>
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Co tu můžeš dělat</h2>
          <SectionActions actionIds={s.actions} />
        </section>

        {s.notes ? (
          <section>
            <h2 className="mb-1 text-sm font-semibold text-zinc-500">Poznámky</h2>
            <p className="text-sm">
              <RuleText>{s.notes}</RuleText>
            </p>
          </section>
        ) : null}
      </article>
    );
  }
  ```

- [ ] **Create `src/app/sekce/page.tsx`**:
  ```tsx
  import { sections } from "@/data";
  import { SectionList } from "@/components/section-list";

  export default function SekcePage() {
    return (
      <main className="p-4">
        <h1 className="sr-only">Sekce</h1>
        <SectionList sections={sections} />
      </main>
    );
  }
  ```

- [ ] **Create `src/app/sekce/[id]/page.tsx`**:
  ```tsx
  import { notFound } from "next/navigation";
  import { sections } from "@/data";
  import { SectionDetail } from "@/components/section-detail";

  export function generateStaticParams() {
    return sections.map((s) => ({ id: s.id }));
  }

  export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const section = sections.find((s) => s.id === id);
    if (!section) notFound();
    return (
      <main>
        <SectionDetail section={section} />
      </main>
    );
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — section list (41 / dark 7), section detail actions, bottom-nav 5; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports `/sekce` + 41 `/sekce/<id>` pages.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet*.tsx`.
- Keep all existing tests passing (note the bottom-nav test now expects five links).

## 5. Acceptance Criteria

1. `pnpm test` passes (section list + filter, section detail, bottom-nav 5, all prior).
2. `pnpm lint` zero warnings; `pnpm build` exports `/sekce` and 41 `/sekce/<id>` pages.
3. Bottom nav has a "Sekce" tab; `/sekce` groups by zone with property filters; detail shows
   properties + glossary-linked actions + notes.
4. Report written to `docs/blueprint/reports/report_022.md`.
