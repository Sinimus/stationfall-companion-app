# TASK 030: Typography foundation — fixed dark theme + Inter + reading rhythm

> **Status:** PENDING
> **Assigned to:** Constructor (Sonnet sub-agent)

## 1. Goal

Lay the visual foundation for the UI/UX polish phase, per the design brief: typographically
excellent, readable, simple, mobile-first, **single fixed look — dark by default**.

This task does three things:
1. **Wire a real font** — Inter via `next/font` (currently `body` falls back to Arial; the Geist
   theme vars are dangling and unused).
2. **Lock the app to one fixed dark look** — today a `@media (prefers-color-scheme: dark)` block +
   Tailwind's default media-based `dark:` variant make the app flip with the OS. Force dark always
   and make the existing `dark:` utilities key off a permanent `.dark` class instead of the OS.
3. **Set a comfortable reading rhythm** — base size/line-height + a reusable `measure` width and a
   `<Prose>` primitive for multi-sentence bodies (consumed by the follow-up readability task).

No data files change. No component logic changes (only the global shell + a new presentational
primitive).

## 2. Files

- Modify: `src/app/layout.tsx` (wire Inter; add `dark` + font var to `<html>`)
- Modify: `src/app/globals.css` (class-based dark variant, fixed dark `:root`, font, `measure`, type rhythm)
- Create: `src/components/prose.tsx` + `src/components/__tests__/prose.test.tsx`

> Do NOT touch `src/app/manifest.ts` — it is already dark (`#0a0a0a`).

## 3. Implementation Steps (TDD)

- [ ] **Add failing test** — `src/components/__tests__/prose.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { Prose } from "@/components/prose";

  describe("Prose", () => {
    it("wraps text in a constrained reading measure with relaxed leading", () => {
      render(<Prose>Dlouhá definice pravidla.</Prose>);
      const el = screen.getByText("Dlouhá definice pravidla.");
      expect(el).toHaveClass("measure");
      expect(el).toHaveClass("leading-relaxed");
    });
    it("merges an extra className", () => {
      render(<Prose className="mt-4">x</Prose>);
      expect(screen.getByText("x")).toHaveClass("mt-4");
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/prose` does not exist.

- [ ] **Create `src/components/prose.tsx`**:
  ```tsx
  import type { ReactNode } from "react";

  /**
   * Čtecí blok pro víceřádkový / vícevětý text. Omezí šířku řádku (measure ≈ 65 znaků)
   * a přidá štědré řádkování, aby dlouhé definice/odpovědi netvořily slitý „block of text".
   */
  export function Prose({
    children,
    className = "",
  }: {
    children: ReactNode;
    className?: string;
  }) {
    return <div className={`measure leading-relaxed ${className}`}>{children}</div>;
  }
  ```

- [ ] **Wire Inter in `src/app/layout.tsx`**:
  - Add the import near the top:
    ```ts
    import { Inter } from "next/font/google";
    ```
  - Below the imports, instantiate (note `latin-ext` — required for Czech diacritics ř ě š č ž ů):
    ```ts
    const inter = Inter({
      subsets: ["latin", "latin-ext"],
      variable: "--font-inter",
      display: "swap",
    });
    ```
  - Change the `<html>` tag to carry the permanent `dark` class + the font variable:
    ```tsx
    <html lang="cs" className={`dark ${inter.variable}`}>
    ```
  - Leave `viewport.themeColor: "#0a0a0a"` as is.

- [ ] **Rewrite `src/app/globals.css`** to this (class-based dark variant + fixed dark base + Inter +
  reading rhythm + `measure` utility; the category colors stay unchanged):
  ```css
  @import "tailwindcss";

  /* Dark variant je vázán na třídu .dark (trvale na <html>) — appka je vždy tmavá,
     nezávisle na OS preferenci. Existující dark: utility se tím aktivují natrvalo. */
  @custom-variant dark (&:where(.dark, .dark *));

  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }

  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    font-size: 0.9375rem; /* 15px — pohodlné čtení u stolu */
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Čtecí šířka pro delší texty (≈ 65 znaků na řádek). */
  @utility measure {
    max-width: 65ch;
  }

  @theme {
    --color-cat-pohybove: #f5c518;
    --color-cat-obranne: #22c55e;
    --color-cat-utocne: #ef4444;
    --color-cat-konspiracni: #a855f7;
    --color-cat-ovladaci-panel: #f97316;
    --color-cat-doplnkove: #ec4899;
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — Prose tests + all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. Inter loads via `next/font` (self-hosted, no layout
  shift); every page renders on the fixed dark background regardless of OS theme.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit data files or `manifest.ts`.
- Do NOT remove `dark:` utility classes from components — they are now the intended permanent look
  (a later task may prune redundant light/`dark:` pairs; not here).
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (Prose render/merge; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. App is always dark (no OS flip); Inter is the active font with correct Czech diacritics; body has
   a 15px / 1.6 reading rhythm; `measure` utility and `<Prose>` primitive exist for the next task.
4. Report written to `docs/blueprint/reports/report_030.md`.
