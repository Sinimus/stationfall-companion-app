# TASK 015: Linkify keywords inside glossary definitions

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Make keywords tappable *inside* a term's definition text in the bottom-sheet (today the definition is
plain, so a definition referencing another term is a dead-end). Break the `RuleText` ↔ `TermSheet`
circular import by extracting the context to its own module.

## 2. Files

- Create: `src/components/term-sheet-context.tsx`
- Modify: `src/components/term-sheet.tsx` (use the extracted context; render `term.text` via `RuleText`)
- Modify: `src/components/rule-text.tsx` (import `useTermSheet` from the context module)
- Modify: `src/components/__tests__/term-sheet.test.tsx` (add a definition-linkify test)

## 3. Implementation Steps (TDD)

- [ ] **Add failing test** — append to `src/components/__tests__/term-sheet.test.tsx` (inside the
  existing `describe`):
  ```tsx
  it("linkifies keywords inside the definition text", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    // The definition contains the word "autodestrukce" (a glossary term) — it must be a button.
    expect(within(dialog).getByRole("button", { name: "autodestrukce" })).toBeInTheDocument();
  });
  ```
  (If `within` / `userEvent` are not already imported in this file, add them.)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — the definition renders as plain text, no "autodestrukce" button.

- [ ] **Create `src/components/term-sheet-context.tsx`** (the context + hook only):
  ```tsx
  "use client";

  import { createContext, useContext } from "react";

  export type TermSheetCtx = { openTerm: (id: string) => void; close: () => void };

  export const TermSheetContext = createContext<TermSheetCtx | null>(null);

  export function useTermSheet(): TermSheetCtx {
    const ctx = useContext(TermSheetContext);
    if (ctx === null) throw new Error("useTermSheet must be used within TermSheetProvider");
    return ctx;
  }
  ```

- [ ] **Refactor `src/components/term-sheet.tsx`**:
  - Remove the local `createContext` / `useContext` / `useTermSheet` definitions.
  - Import the context: `import { TermSheetContext } from "@/components/term-sheet-context";`
  - Re-export the hook so existing importers keep working:
    `export { useTermSheet } from "@/components/term-sheet-context";`
  - Use `<TermSheetContext.Provider value={{ openTerm, close }}>` (was the local context).
  - Import `RuleText` and render the definition through it:
    `<p className="text-sm"><RuleText>{term.text}</RuleText></p>`
  - Leave the seeAlso / related-characters / ruleRefs sections unchanged.

- [ ] **Update `src/components/rule-text.tsx`** — change the import so it does NOT depend on
  `term-sheet.tsx` (which now imports `RuleText`):
  ```tsx
  import { useTermSheet } from "@/components/term-sheet-context";
  ```
  (Everything else in `rule-text.tsx` stays the same.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — definition now linkifies "autodestrukce"; all prior suites green (the re-export
  keeps `import { useTermSheet } from "@/components/term-sheet"` working everywhere else).

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build still exports. No circular-import warning.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*`.
- Keep all existing tests passing. Do not change the public API used by other components
  (`useTermSheet`, `TermSheetProvider` must remain importable from `@/components/term-sheet`).

## 5. Acceptance Criteria

1. `pnpm test` passes (definition linkify + all prior).
2. `pnpm lint` zero warnings; `pnpm build` exports all routes; no circular dependency.
3. Opening a glossary term whose definition references another term shows that keyword as a tappable
   button that switches the sheet.
4. Report written to `docs/blueprint/reports/report_015.md`.
