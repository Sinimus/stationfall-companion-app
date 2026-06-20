# TASK 033: Iconography — lucide icons as label complements

> **Status:** DONE
> **Assigned to:** Constructor (Sonnet sub-agent)

## 1. Goal

Per the design brief: *"icons complement the text, they don't replace it."* Add a small, consistent
lucide-react icon vocabulary as **prefixes to existing text labels** — ability categories, character
types, section zones, gravity, and section properties. Every icon sits next to its text label and is
`aria-hidden` (the text carries meaning for a11y). Filters stay text-only (kept clean, out of scope).

`lucide-react` is already a dependency (used in `bottom-nav`). All icon names below are verified to
exist in the installed version.

## 2. Files

- Modify: `src/lib/categories.ts` (add `CATEGORY_ICON`, `TYPE_ICON`)
- Modify: `src/lib/sections.ts` (add `ZONE_ICON`, `GRAVITY_ICON`)
- Create: `src/components/category-badge.tsx` + `src/components/__tests__/category-badge.test.tsx`
- Modify: `src/components/character-dossier.tsx` (ability badge → `CategoryBadge`; type icon in header)
- Modify: `src/components/term-sheet.tsx` (glossary category chip → `CategoryBadge`)
- Modify: `src/components/character-list.tsx` (type icon on cards)
- Modify: `src/components/section-list.tsx` (zone icon in group headers; gravity icon on cards)
- Modify: `src/components/section-detail.tsx` (zone/gravity/dark + property badges get icons)

## 3. Implementation Steps (TDD)

- [ ] **Add icon maps to `src/lib/categories.ts`** (append, keeping existing exports):
  ```ts
  import type { LucideIcon } from "lucide-react";
  import {
    Footprints,
    Shield,
    Swords,
    EyeOff,
    SlidersHorizontal,
    Sparkles,
    User,
    Bot,
    Database,
    Package,
  } from "lucide-react";

  export const CATEGORY_ICON: Record<AbilityCategory, LucideIcon> = {
    pohybove: Footprints,
    obranne: Shield,
    utocne: Swords,
    konspiracni: EyeOff,
    "ovladaci-panel": SlidersHorizontal,
    doplnkove: Sparkles,
  };

  export const TYPE_ICON: Record<CharacterType, LucideIcon> = {
    clovek: User,
    robot: Bot,
    data: Database,
    predmet: Package,
  };
  ```

- [ ] **Add icon maps to `src/lib/sections.ts`** (append):
  ```ts
  import type { LucideIcon } from "lucide-react";
  import { CircleDot, Circle, Orbit, Rocket, Star, ArrowDownToLine, Feather } from "lucide-react";

  export const ZONE_ICON: Record<SectionZone, LucideIcon> = {
    "horni-prstenec": CircleDot,
    "dolni-prstenec": Circle,
    "centralni-osa": Orbit,
    "unikovy-modul": Rocket,
    specialni: Star,
  };

  export const GRAVITY_ICON: Record<Section["gravity"], LucideIcon> = {
    gravitace: ArrowDownToLine,
    nulova: Feather,
  };
  ```

- [ ] **Add failing test** — `src/components/__tests__/category-badge.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { CategoryBadge } from "@/components/category-badge";

  describe("CategoryBadge", () => {
    it("shows the category label next to an icon (icon complements, not replaces)", () => {
      const { container } = render(<CategoryBadge category="utocne" />);
      expect(screen.getByText("Útočné")).toBeInTheDocument();
      expect(container.querySelector("svg")).not.toBeNull();
    });
    it("merges an extra className", () => {
      const { container } = render(<CategoryBadge category="obranne" className="mb-2" />);
      expect(container.firstChild).toHaveClass("mb-2");
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/category-badge` does not exist.

- [ ] **Create `src/components/category-badge.tsx`**:
  ```tsx
  import { CATEGORY_BG_CLASS, CATEGORY_LABEL, CATEGORY_ICON, type AbilityCategory } from "@/lib/categories";

  /** Barevný štítek kategorie schopnosti: ikona + barva + text (ikona je doplněk, ne náhrada). */
  export function CategoryBadge({
    category,
    className = "",
  }: {
    category: AbilityCategory;
    className?: string;
  }) {
    const Icon = CATEGORY_ICON[category];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[category]} ${className}`}
      >
        <Icon className="size-3" aria-hidden />
        {CATEGORY_LABEL[category]}
      </span>
    );
  }
  ```

- [ ] **`src/components/character-dossier.tsx`**:
  - Update the categories import to drop the now-unused chip helpers and add the type icon:
    ```ts
    import { TYPE_LABEL, TYPE_ICON } from "@/lib/categories";
    import { CategoryBadge } from "@/components/category-badge";
    ```
    (Remove `CATEGORY_BG_CLASS, CATEGORY_LABEL` from the import — they move into `CategoryBadge`.)
  - In `AbilityRow`, replace the category `<span>`:
    ```tsx
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[ability.category]}`}>
      {CATEGORY_LABEL[ability.category]}
    </span>
    ```
    →
    ```tsx
    <CategoryBadge category={ability.category} />
    ```
  - In the header, add the type icon before the subtitle text. Change:
    ```tsx
    <p className="text-sm text-zinc-500">
      {TYPE_LABEL[c.type]} · Limit vlivu {c.influenceLimit} · {c.address}
    </p>
    ```
    →
    ```tsx
    <p className="flex items-center gap-1 text-sm text-zinc-500">
      {(() => {
        const TypeIcon = TYPE_ICON[c.type];
        return <TypeIcon className="size-3.5" aria-hidden />;
      })()}
      {TYPE_LABEL[c.type]} · Limit vlivu {c.influenceLimit} · {c.address}
    </p>
    ```
    (Or hoist `const TypeIcon = TYPE_ICON[c.type];` to the top of `CharacterDossier` and render
    `<TypeIcon className="size-3.5" aria-hidden />` — either is fine; prefer the hoisted const.)

- [ ] **`src/components/term-sheet.tsx`** — glossary category chip. Remove the
  `import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from "@/lib/categories";` line, add
  `import { CategoryBadge } from "@/components/category-badge";`, and replace:
  ```tsx
  <span className={`mb-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[term.category]}`}>
    {CATEGORY_LABEL[term.category]}
  </span>
  ```
  →
  ```tsx
  <CategoryBadge category={term.category} className="mb-2" />
  ```

- [ ] **`src/components/character-list.tsx`** — type icon on the cards. Add `TYPE_ICON` to the
  categories import. Replace the card subtitle:
  ```tsx
  <span className="text-xs text-zinc-500">{TYPE_LABEL[c.type]}</span>
  ```
  →
  ```tsx
  <span className="flex items-center gap-1 text-xs text-zinc-500">
    {(() => {
      const TypeIcon = TYPE_ICON[c.type];
      return <TypeIcon className="size-3" aria-hidden />;
    })()}
    {TYPE_LABEL[c.type]}
  </span>
  ```
  (Leave the filter buttons text-only.)

- [ ] **`src/components/section-list.tsx`** — import `ZONE_ICON, GRAVITY_ICON` from `@/lib/sections`.
  - Group header — inside the `ZONE_ORDER.map`, derive `const ZoneIcon = ZONE_ICON[zone];` and:
    ```tsx
    <h2 className="mb-1 text-sm font-semibold text-zinc-500">{ZONE_LABEL[zone]}</h2>
    ```
    →
    ```tsx
    <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-500">
      <ZoneIcon className="size-3.5" aria-hidden />
      {ZONE_LABEL[zone]}
    </h2>
    ```
  - Card subtitle — inside the `group.map`, derive `const GravIcon = GRAVITY_ICON[s.gravity];` and:
    ```tsx
    <span className="text-xs text-zinc-500">
      {GRAVITY_LABEL[s.gravity]}
      {s.lit === false ? " · temná" : ""}
    </span>
    ```
    →
    ```tsx
    <span className="flex items-center gap-1 text-xs text-zinc-500">
      <GravIcon className="size-3" aria-hidden />
      {GRAVITY_LABEL[s.gravity]}
      {s.lit === false ? " · temná" : ""}
    </span>
    ```

- [ ] **`src/components/section-detail.tsx`** — icons in the header + property badges.
  - Add imports: `import { ZONE_LABEL, GRAVITY_LABEL, ZONE_ICON, GRAVITY_ICON } from "@/lib/sections";`
    and `import { Zap, SlidersHorizontal, Rocket, Moon } from "lucide-react";`
  - At the top of `SectionDetail`, derive `const ZoneIcon = ZONE_ICON[s.zone];` and
    `const GravIcon = GRAVITY_ICON[s.gravity];`
  - Replace the subtitle `<p>`:
    ```tsx
    <p className="text-sm text-zinc-500">
      {ZONE_LABEL[s.zone]} · {GRAVITY_LABEL[s.gravity]}
      {s.lit === false ? " · temná (bez kamer)" : ""}
    </p>
    ```
    →
    ```tsx
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500">
      <span className="inline-flex items-center gap-1">
        <ZoneIcon className="size-3.5" aria-hidden />
        {ZONE_LABEL[s.zone]}
      </span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <GravIcon className="size-3.5" aria-hidden />
        {GRAVITY_LABEL[s.gravity]}
      </span>
      {s.lit === false ? (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Moon className="size-3.5" aria-hidden />
            temná (bez kamer)
          </span>
        </>
      ) : null}
    </p>
    ```
  - Property badges — add an icon to each (keep the colored backgrounds):
    ```tsx
    {s.powered ? (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">Napájecí sekce</span>
    ) : null}
    {s.consolePanel ? (
      <span className="rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900/40">Ovládací panel</span>
    ) : null}
    {s.escapePod ? (
      <span className="rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/40">Únikový modul</span>
    ) : null}
    ```
    →
    ```tsx
    {s.powered ? (
      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">
        <Zap className="size-3" aria-hidden />
        Napájecí sekce
      </span>
    ) : null}
    {s.consolePanel ? (
      <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900/40">
        <SlidersHorizontal className="size-3" aria-hidden />
        Ovládací panel
      </span>
    ) : null}
    {s.escapePod ? (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/40">
        <Rocket className="size-3" aria-hidden />
        Únikový modul
      </span>
    ) : null}
    ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — CategoryBadge + all prior green. Icons are `aria-hidden` and text labels remain, so
  `getByText` / `getByRole` lookups are unaffected. If any pre-existing test asserted a category chip
  by an exact full-string and now fails, make it a partial/substring match — do NOT weaken coverage.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings (no unused imports — `CATEGORY_BG_CLASS`/`CATEGORY_LABEL` were removed
  from dossier and term-sheet); build exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit any `src/data/*` file.
- Icons are decorative complements: always `aria-hidden`, always beside the existing text label,
  `size-3`/`size-3.5`. Never an icon-only control.
- Keep all existing tests passing (adjust only exact-string matchers broken by icon insertion).

## 5. Acceptance Criteria

1. `pnpm test` passes (CategoryBadge; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Ability categories (dossier + glossary), character types (dossier header + cards), section zones,
   gravity and section properties all show a consistent icon beside their text label; filters remain
   text-only; no icon-only controls.
4. Report written to `docs/blueprint/reports/report_033.md`.
