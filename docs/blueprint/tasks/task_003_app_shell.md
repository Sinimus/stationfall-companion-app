# TASK 003: Navigable app shell, category color system & UI test infra

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Turn the skeleton into a navigable, themed mobile shell: bottom tab navigation across the four
sections, the official 6-category color tokens + helpers, Czech document metadata, and component
test infrastructure (jsdom + Testing Library).

## 2. Files

- Add deps: `lucide-react`; dev: `jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event`
- Modify: `vitest.config.ts` (jsdom env + setup), `src/app/layout.tsx` (cs metadata + nav), `src/app/globals.css` (category tokens)
- Create: `vitest.setup.ts`
- Create: `src/components/bottom-nav.tsx` + `src/components/__tests__/bottom-nav.test.tsx`
- Create: `src/lib/categories.ts` + `src/lib/__tests__/categories.test.ts`
- Create routes: `src/app/page.tsx` (replace → redirect), `src/app/postavy/page.tsx`,
  `src/app/glosar/page.tsx`, `src/app/pruvodci/page.tsx`, `src/app/hledat/page.tsx`

> shadcn/ui is intentionally NOT installed here; it will be initialized in the first feature task
> that needs a primitive (the glossary bottom-sheet). Use plain Tailwind (zinc palette) for the shell.

## 3. Implementation Steps (TDD)

- [ ] **Install deps**
  ```bash
  pnpm add lucide-react
  pnpm add -D jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
  ```

- [ ] **Switch Vitest to jsdom** — replace `vitest.config.ts`:
  ```ts
  import { defineConfig } from "vitest/config";
  import tsconfigPaths from "vite-tsconfig-paths";

  export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./vitest.setup.ts"],
    },
  });
  ```
  Create `vitest.setup.ts`:
  ```ts
  import "@testing-library/jest-dom/vitest";
  ```

- [ ] **Write failing tests**

  `src/lib/__tests__/categories.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { ABILITY_CATEGORIES, CATEGORY_LABEL, CATEGORY_BG_CLASS } from "@/lib/categories";

  describe("category helpers", () => {
    it("covers all six official categories", () => {
      expect(ABILITY_CATEGORIES).toHaveLength(6);
    });
    it("has a label and bg class for every category", () => {
      for (const c of ABILITY_CATEGORIES) {
        expect(CATEGORY_LABEL[c]).toBeTruthy();
        expect(CATEGORY_BG_CLASS[c]).toMatch(/^bg-cat-/);
      }
    });
  });
  ```

  `src/components/__tests__/bottom-nav.test.tsx`:
  ```tsx
  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { BottomNav } from "@/components/bottom-nav";

  vi.mock("next/navigation", () => ({ usePathname: () => "/glosar" }));

  describe("BottomNav", () => {
    it("renders the four destinations", () => {
      render(<BottomNav />);
      expect(screen.getAllByRole("link")).toHaveLength(4);
      for (const label of ["Postavy", "Glosář", "Průvodci", "Hledat"]) {
        expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
      }
    });
    it("marks the active route with aria-current", () => {
      render(<BottomNav />);
      expect(screen.getByRole("link", { name: /Glosář/ })).toHaveAttribute("aria-current", "page");
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/categories` and `@/components/bottom-nav` do not exist.

- [ ] **Implement `src/lib/categories.ts`** (type derived from data — no new source of truth):
  ```ts
  import type { Character } from "@/data";

  export type AbilityCategory = Character["abilities"][number]["category"];

  export const ABILITY_CATEGORIES = [
    "pohybove",
    "obranne",
    "utocne",
    "konspiracni",
    "ovladaci-panel",
    "doplnkove",
  ] as const satisfies readonly AbilityCategory[];

  export const CATEGORY_LABEL: Record<AbilityCategory, string> = {
    pohybove: "Pohybové",
    obranne: "Obranné",
    utocne: "Útočné",
    konspiracni: "Konspirační",
    "ovladaci-panel": "Ovládací panel",
    doplnkove: "Doplňkové",
  };

  export const CATEGORY_BG_CLASS: Record<AbilityCategory, string> = {
    pohybove: "bg-cat-pohybove",
    obranne: "bg-cat-obranne",
    utocne: "bg-cat-utocne",
    konspiracni: "bg-cat-konspiracni",
    "ovladaci-panel": "bg-cat-ovladaci-panel",
    doplnkove: "bg-cat-doplnkove",
  };
  ```

- [ ] **Add category color tokens** — append to `src/app/globals.css` (after the existing
  `@import "tailwindcss";`; official key colors):
  ```css
  @theme {
    --color-cat-pohybove: #f5c518;
    --color-cat-obranne: #22c55e;
    --color-cat-utocne: #ef4444;
    --color-cat-konspiracni: #a855f7;
    --color-cat-ovladaci-panel: #f97316;
    --color-cat-doplnkove: #ec4899;
  }
  ```

- [ ] **Implement `src/components/bottom-nav.tsx`**:
  ```tsx
  "use client";

  import Link from "next/link";
  import { usePathname } from "next/navigation";
  import { Users, BookOpen, Route, Search } from "lucide-react";

  const ITEMS = [
    { href: "/postavy", label: "Postavy", Icon: Users },
    { href: "/glosar", label: "Glosář", Icon: BookOpen },
    { href: "/pruvodci", label: "Průvodci", Icon: Route },
    { href: "/hledat", label: "Hledat", Icon: Search },
  ] as const;

  export function BottomNav() {
    const pathname = usePathname();
    return (
      <nav
        aria-label="Hlavní navigace"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      >
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-500 aria-[current=page]:text-zinc-900 dark:aria-[current=page]:text-zinc-100"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }
  ```

- [ ] **Replace `src/app/layout.tsx`** (Czech metadata, nav, bottom padding for nav clearance):
  ```tsx
  import type { Metadata } from "next";
  import type { ReactNode } from "react";
  import "./globals.css";
  import { BottomNav } from "@/components/bottom-nav";

  export const metadata: Metadata = {
    title: "Stationfall Companion",
    description: "Pravidlový průvodce deskovkou Stationfall (Zkáza na orbitě).",
  };

  export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="cs">
        <body className="min-h-dvh pb-16 antialiased">
          {children}
          <BottomNav />
        </body>
      </html>
    );
  }
  ```

- [ ] **Create route stubs** — for each of `postavy`, `glosar`, `pruvodci`, `hledat` create
  `src/app/<slug>/page.tsx` with the matching heading, e.g.:
  ```tsx
  export default function PostavyPage() {
    return (
      <main className="p-4">
        <h1 className="text-xl font-semibold">Postavy</h1>
      </main>
    );
  }
  ```
  (Headings: "Postavy", "Glosář", "Průvodci", "Hledat".)

- [ ] **Replace `src/app/page.tsx`** with a client redirect to the default tab (static-export safe):
  ```tsx
  "use client";

  import { useEffect } from "react";
  import { useRouter } from "next/navigation";

  export default function Home() {
    const router = useRouter();
    useEffect(() => {
      router.replace("/postavy");
    }, [router]);
    return null;
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — data (7) + categories (2) + bottom-nav (2) all green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; static export builds `/postavy`, `/glosar`, `/pruvodci`, `/hledat`, `/`.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. pnpm only. Do NOT install shadcn/ui in this task.
- Do not modify data files, `schema.ts`, `schemas.ts`, or `src/data/index.ts`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (all suites: data, categories, bottom-nav).
2. `pnpm build` statically exports all five routes; `pnpm lint` zero warnings.
3. Bottom nav is present on every page, marks the active tab (`aria-current="page"`), `<html lang="cs">`.
4. Category color utilities (`bg-cat-*`) resolve from the `@theme` tokens.
5. Report written to `docs/blueprint/reports/report_003.md`.
