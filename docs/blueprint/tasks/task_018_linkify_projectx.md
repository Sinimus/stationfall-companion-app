# TASK 018: Clickable Project X names + entity bottom-sheet + search

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Link Project X names in text and open them in the bottom-sheet (generalize the sheet to show a
glossary term OR a Project X card), and make Project X search results open that sheet.

## 2. Files

- Modify: `src/lib/lookups.ts` (add `projectById`)
- Modify: `src/lib/linkify.ts` (add `"projectx"` kind + index Project X names)
- Modify: `src/lib/__tests__/linkify.test.ts` (projectx ref test)
- Modify: `src/components/term-sheet-context.tsx` (add `openProject`)
- Modify: `src/components/term-sheet.tsx` (entity sheet: term OR Project X)
- Modify: `src/components/rule-text.tsx` (projectx → `openProject`)
- Modify: `src/components/__tests__/rule-text.test.tsx` (open Project X from a linked name)
- Modify: `src/app/hledat/page.tsx` (projectx result → open sheet)

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  Append to `src/lib/__tests__/linkify.test.ts`:
  ```ts
  it("links a Project X name to the projectx kind", () => {
    const parts = splitText("Pozor na Entropický přízrak v sekci.");
    expect(parts.some((p) => p.ref?.kind === "projectx")).toBe(true);
  });
  ```

  Append to `src/components/__tests__/rule-text.test.tsx`:
  ```tsx
  it("opens a Project X card from a linked name", async () => {
    const user = userEvent.setup();
    render(
      <TermSheetProvider>
        <RuleText>Pozor na Entropický přízrak.</RuleText>
      </TermSheetProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Entropický přízrak" }));
    expect(screen.getByRole("dialog", { name: "Entropický přízrak" })).toBeInTheDocument();
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — projectx not matched; `openProject` not defined.

- [ ] **Add `projectById` to `src/lib/lookups.ts`**:
  - Extend the data import: `import { characters, glossary, projectsX, type GlossaryTerm, type ProjectX } from "@/data";`
  - Add: `export const projectById = new Map<string, ProjectX>(projectsX.map((p) => [p.id, p]));`

- [ ] **Add projectx to `src/lib/linkify.ts`**:
  - Extend the union: `export type LinkRef = { kind: "glossary" | "character" | "projectx"; id: string };`
  - Import `projectsX` (extend the `@/data` import).
  - Add Project X entries to the `entries` array:
    ```ts
    ...projectsX.map((p) => ({ ref: { kind: "projectx" as const, id: p.id }, name: p.nameCs })),
    ```

- [ ] **Add `openProject` to `src/components/term-sheet-context.tsx`**:
  ```ts
  export type TermSheetCtx = {
    openTerm: (id: string) => void;
    openProject: (id: string) => void;
    close: () => void;
  };
  ```
  (Keep `TermSheetContext` / `useTermSheet` as they are.)

- [ ] **Replace `src/components/term-sheet.tsx`** with the entity sheet (complete file):
  ```tsx
  "use client";

  import { useCallback, useEffect, useState, type ReactNode } from "react";
  import Link from "next/link";
  import { glossaryById, characterNameById, projectById, KIND_LABEL } from "@/lib/lookups";
  import { characterIds } from "@/data";
  import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from "@/lib/categories";
  import { TermSheetContext } from "@/components/term-sheet-context";
  import { RuleText } from "@/components/rule-text";

  export { useTermSheet } from "@/components/term-sheet-context";

  type OpenRef = { kind: "glossary"; id: string } | { kind: "projectx"; id: string };

  export function TermSheetProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState<OpenRef | null>(null);
    const openTerm = useCallback((id: string) => setOpen({ kind: "glossary", id }), []);
    const openProject = useCallback((id: string) => setOpen({ kind: "projectx", id }), []);
    const close = useCallback(() => setOpen(null), []);

    useEffect(() => {
      if (open === null) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, close]);

    const term = open?.kind === "glossary" ? (glossaryById.get(open.id) ?? null) : null;
    const project = open?.kind === "projectx" ? (projectById.get(open.id) ?? null) : null;
    const title = term?.nameCs ?? project?.nameCs ?? "";
    const isOpen = term !== null || project !== null;

    return (
      <TermSheetContext.Provider value={{ openTerm, openProject, close }}>
        {children}
        {isOpen ? (
          <div className="fixed inset-0 z-50" role="presentation" onClick={close}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-auto rounded-t-2xl bg-white p-4 dark:bg-zinc-950"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="text-xs text-zinc-500">
                    {term !== null ? KIND_LABEL[term.kind] : "Projekt X"}
                  </p>
                </div>
                <button type="button" onClick={close} aria-label="Zavřít" className="rounded p-1 text-zinc-500">
                  ✕
                </button>
              </div>

              {term !== null ? (
                <>
                  {term.category !== undefined ? (
                    <span
                      className={`mb-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[term.category]}`}
                    >
                      {CATEGORY_LABEL[term.category]}
                    </span>
                  ) : null}

                  <p className="text-sm">
                    <RuleText>{term.text}</RuleText>
                  </p>

                  {term.relatedCharacterIds && term.relatedCharacterIds.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-zinc-500">Objevuje se u</p>
                      <div className="flex flex-wrap gap-2">
                        {term.relatedCharacterIds.map((cid) => (
                          <Link key={cid} href={`/postavy/${cid}`} onClick={close} className="text-sm underline">
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
                              <button key={sid} type="button" onClick={() => openTerm(sid)} className="text-sm underline">
                                {t.nameCs}
                              </button>
                            );
                          }
                          if (characterIds.has(sid)) {
                            return (
                              <Link key={sid} href={`/postavy/${sid}`} onClick={close} className="text-sm underline">
                                {characterNameById.get(sid) ?? sid}
                              </Link>
                            );
                          }
                          return (
                            <Link key={sid} href={`/pruvodci/${sid}`} onClick={close} className="text-sm underline">
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
                </>
              ) : null}

              {project !== null ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <RuleText>{project.text}</RuleText>
                  </p>
                  {project.trigger ? (
                    <p className="text-xs text-zinc-500">
                      Spuštění: <RuleText>{project.trigger}</RuleText>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </TermSheetContext.Provider>
    );
  }
  ```

- [ ] **Update `src/components/rule-text.tsx`** — handle the projectx kind:
  - Destructure: `const { openTerm, openProject } = useTermSheet();`
  - Add before the glossary fallback:
    ```tsx
    if (ref.kind === "projectx") {
      return (
        <button key={i} type="button" onClick={() => openProject(ref.id)} className={LINK_CLASS}>
          {part.text}
        </button>
      );
    }
    ```

- [ ] **Update `src/app/hledat/page.tsx`** — Project X results open the sheet:
  - Destructure `const { openTerm, openProject } = useTermSheet();`
  - Render: `r.type === "glossary"` → button `openTerm(r.id)`; `r.type === "projectx"` → button
    `openProject(r.id)`; otherwise the `<Link href={hrefFor(r)}>`.
  - In `hrefFor`, remove the projectx fallback note (projectx no longer routes to a page); faq still
    returns `/pruvodci`, character `/postavy/<id>`, flow `/pruvodci/<id>`.

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — projectx linkify; Project X opens in the sheet; glossary term sheet still works
  (open, seeAlso, definition-linkify, close); search; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports; built character pages render Project X names as
  buttons (e.g. agentka's edge case "Entropický přízrak").

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `as string`, `@ts-ignore`. Do not modify data / `src/data/*`.
- Keep all existing tests passing (glossary sheet behavior must be unchanged).

## 5. Acceptance Criteria

1. `pnpm test` passes (projectx linkify; Project X opens in sheet; glossary unchanged; search; all prior).
2. `pnpm lint` zero warnings; `pnpm build` exports all routes.
3. Project X names in any text are tappable and open the card in the bottom-sheet; Project X search
   results open the same sheet.
4. Report written to `docs/blueprint/reports/report_018.md`.
