# TASK 006: Glossary browser + term bottom-sheet

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Browse the 109 glossary terms on `/glosar` grouped by kind (filterable), and open any term in a
reusable bottom-sheet showing its definition, "objevuje se u" (related characters), related terms
(seeAlso) and rule references.

## Design note

The bottom-sheet is a React-state overlay with `role="dialog"` / `aria-modal` — **not** shadcn/ui
and **not** the native `<dialog>` element. Rationale: dependency-light, fully testable under jsdom
(native `dialog.showModal()` is unreliable in jsdom), and avoids a shadcn-init clash with the
existing `globals.css` (`@theme` category tokens). The provider exposes a `useTermSheet().openTerm(id)`
hook so task 007 can open terms from inline links anywhere in the app.

## 2. Files

- Create: `src/lib/lookups.ts`
- Create: `src/components/term-sheet.tsx` + `src/components/__tests__/term-sheet.test.tsx`
- Create: `src/components/glossary-browser.tsx`
- Modify: `src/app/layout.tsx` (wrap children in `TermSheetProvider`)
- Modify: `src/app/glosar/page.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Implement `src/lib/lookups.ts`**:
  ```ts
  import { characters, glossary, type GlossaryTerm } from "@/data";

  export const glossaryById = new Map<string, GlossaryTerm>(glossary.map((g) => [g.id, g]));
  export const characterNameById = new Map<string, string>(
    characters.map((c) => [c.id, c.nameCs]),
  );

  export type GlossaryKind = GlossaryTerm["kind"];

  export const KIND_ORDER = [
    "pojem",
    "stav",
    "predmet",
    "data",
    "nebezpeci",
    "system",
    "sekce",
    "akce",
    "schopnost",
  ] as const satisfies readonly GlossaryKind[];

  export const KIND_LABEL: Record<GlossaryKind, string> = {
    pojem: "Pojmy",
    stav: "Stavy",
    predmet: "Předměty",
    data: "Data",
    nebezpeci: "Nebezpečí",
    system: "Systémy stanice",
    sekce: "Sekce",
    akce: "Akce",
    schopnost: "Schopnosti",
  };
  ```

- [ ] **Write failing test** — `src/components/__tests__/term-sheet.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen, within } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { glossary } from "@/data";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { GlossaryBrowser } from "@/components/glossary-browser";

  function renderBrowser() {
    render(
      <TermSheetProvider>
        <GlossaryBrowser terms={glossary} />
      </TermSheetProvider>,
    );
  }

  describe("Glossary + TermSheet", () => {
    it("opens a term in the bottom-sheet", async () => {
      const user = userEvent.setup();
      renderBrowser();
      await user.click(screen.getByRole("button", { name: "Antihmota" }));
      const dialog = screen.getByRole("dialog", { name: "Antihmota" });
      expect(within(dialog).getByText(/odjistí/)).toBeInTheDocument();
    });

    it("follows a seeAlso link to another term within the sheet", async () => {
      const user = userEvent.setup();
      renderBrowser();
      await user.click(screen.getByRole("button", { name: "Antihmota" }));
      const dialog = screen.getByRole("dialog", { name: "Antihmota" });
      await user.click(within(dialog).getByRole("button", { name: "Evakuace" }));
      expect(screen.getByRole("dialog", { name: "Evakuace" })).toBeInTheDocument();
    });

    it("closes the sheet", async () => {
      const user = userEvent.setup();
      renderBrowser();
      await user.click(screen.getByRole("button", { name: "Antihmota" }));
      await user.click(screen.getByRole("button", { name: "Zavřít" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/term-sheet` and `@/components/glossary-browser` do not exist.

- [ ] **Implement `src/components/term-sheet.tsx`** (complete, no placeholders):
  ```tsx
  "use client";

  import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from "react";
  import Link from "next/link";
  import { glossaryById, characterNameById, KIND_LABEL } from "@/lib/lookups";
  import { characterIds } from "@/data";
  import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from "@/lib/categories";

  type TermSheetCtx = { openTerm: (id: string) => void; close: () => void };

  const Ctx = createContext<TermSheetCtx | null>(null);

  export function useTermSheet(): TermSheetCtx {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useTermSheet must be used within TermSheetProvider");
    return ctx;
  }

  export function TermSheetProvider({ children }: { children: ReactNode }) {
    const [openId, setOpenId] = useState<string | null>(null);
    const openTerm = useCallback((id: string) => setOpenId(id), []);
    const close = useCallback(() => setOpenId(null), []);

    useEffect(() => {
      if (openId === null) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [openId, close]);

    const term = openId !== null ? (glossaryById.get(openId) ?? null) : null;

    return (
      <Ctx.Provider value={{ openTerm, close }}>
        {children}
        {term !== null ? (
          <div className="fixed inset-0 z-50" role="presentation" onClick={close}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={term.nameCs}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-auto rounded-t-2xl bg-white p-4 dark:bg-zinc-950"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{term.nameCs}</h2>
                  <p className="text-xs text-zinc-500">{KIND_LABEL[term.kind]}</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Zavřít"
                  className="rounded p-1 text-zinc-500"
                >
                  ✕
                </button>
              </div>

              {term.category !== undefined ? (
                <span
                  className={`mb-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[term.category]}`}
                >
                  {CATEGORY_LABEL[term.category]}
                </span>
              ) : null}

              <p className="text-sm">{term.text}</p>

              {term.relatedCharacterIds && term.relatedCharacterIds.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-zinc-500">Objevuje se u</p>
                  <div className="flex flex-wrap gap-2">
                    {term.relatedCharacterIds.map((cid) => (
                      <Link
                        key={cid}
                        href={`/postavy/${cid}`}
                        onClick={close}
                        className="text-sm underline"
                      >
                        {characterNameById.get(cid) ?? cid}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {term.seeAlso && term.seeAlso.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-zinc-500">Související</p>
                  <div className="flex flex-wrap gap-2">
                    {term.seeAlso.map((sid) => {
                      const t = glossaryById.get(sid);
                      if (t !== undefined) {
                        return (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => openTerm(sid)}
                            className="text-sm underline"
                          >
                            {t.nameCs}
                          </button>
                        );
                      }
                      if (characterIds.has(sid)) {
                        return (
                          <Link
                            key={sid}
                            href={`/postavy/${sid}`}
                            onClick={close}
                            className="text-sm underline"
                          >
                            {characterNameById.get(sid) ?? sid}
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={sid}
                          href={`/pruvodci/${sid}`}
                          onClick={close}
                          className="text-sm underline"
                        >
                          {sid}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {term.ruleRefs && term.ruleRefs.length > 0 ? (
                <p className="mt-3 text-xs text-zinc-500">Pravidla: {term.ruleRefs.join(", ")}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Ctx.Provider>
    );
  }
  ```

- [ ] **Implement `src/components/glossary-browser.tsx`** (complete, no placeholders):
  ```tsx
  "use client";

  import { useState } from "react";
  import type { GlossaryTerm } from "@/data";
  import { useTermSheet } from "@/components/term-sheet";
  import { KIND_ORDER, KIND_LABEL, type GlossaryKind } from "@/lib/lookups";

  export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
    const { openTerm } = useTermSheet();
    const [kind, setKind] = useState<GlossaryKind | null>(null);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Filtr podle druhu">
          {KIND_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(kind === k ? null : k)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        {KIND_ORDER.filter((k) => kind === null || k === kind).map((k) => {
          const group = terms
            .filter((t) => t.kind === k)
            .sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
          if (group.length === 0) return null;
          return (
            <section key={k} aria-label={KIND_LABEL[k]}>
              <h2 className="mb-1 text-sm font-semibold text-zinc-500">{KIND_LABEL[k]}</h2>
              <ul className="flex flex-wrap gap-2">
                {group.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openTerm(t.id)}
                      className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                    >
                      {t.nameCs}
                    </button>
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

- [ ] **Wrap the app in the provider** — modify `src/app/layout.tsx` so the body is:
  ```tsx
  <body className="min-h-dvh pb-16 antialiased">
    <TermSheetProvider>{children}</TermSheetProvider>
    <BottomNav />
  </body>
  ```
  (Add `import { TermSheetProvider } from "@/components/term-sheet";`.)

- [ ] **Wire `src/app/glosar/page.tsx`**:
  ```tsx
  import { glossary } from "@/data";
  import { GlossaryBrowser } from "@/components/glossary-browser";

  export default function GlosarPage() {
    return (
      <main className="p-4">
        <h1 className="sr-only">Glosář</h1>
        <GlossaryBrowser terms={glossary} />
      </main>
    );
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — open term, follow seeAlso, close.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; `/glosar` exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do NOT install shadcn/ui. Do not modify data / `src/data/*`.
- Keep all existing tests passing.
- If a test assertion mismatches the data (term name, seeAlso target), the data is authoritative —
  report it; do not edit data. (`Antihmota`'s seeAlso includes the glossary term `Evakuace`.)

## 5. Acceptance Criteria

1. `pnpm test` passes (open term, seeAlso navigation, close).
2. `pnpm lint` zero warnings; `pnpm build` exports `/glosar`.
3. `/glosar` lists terms grouped by kind with a kind filter; tapping a term opens the bottom-sheet;
   seeAlso glossary links switch the sheet; related characters link to `/postavy/<id>`.
4. `useTermSheet().openTerm(id)` is exported for reuse (task 007 inline links).
5. Report written to `docs/blueprint/reports/report_006.md`.
