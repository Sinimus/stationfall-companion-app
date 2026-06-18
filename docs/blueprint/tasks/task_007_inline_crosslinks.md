# TASK 007: Inline keyword cross-linking

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Auto-link known glossary terms inside free text (ability text, agendas, edge cases, tips, setup,
bonus points) so any keyword is tappable and opens its bottom-sheet — the app's core cross-linking
feature.

## Design note

A `<RuleText>` client component splits a string against a precomputed glossary matcher and renders
matched spans as buttons calling `useTermSheet().openTerm(id)`. Matching is **exact whole-phrase**
on `nameCs`, longest-first, with Unicode-aware boundaries (`\p{L}`) so it respects Czech letters and
won't match inside a word. Inflected forms (e.g. "do Okolního vesmíru") are a known limitation —
a future enhancement can add per-term match aliases to the data. To avoid a circular import,
`RuleText` is NOT used inside `term-sheet.tsx` in this task.

## 2. Files

- Create: `src/lib/linkify.ts` + `src/lib/__tests__/linkify.test.ts`
- Create: `src/components/rule-text.tsx` + `src/components/__tests__/rule-text.test.tsx`
- Modify: `src/components/character-dossier.tsx` (wrap free-text fields in `<RuleText>`)

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/lib/__tests__/linkify.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { splitGlossaryText } from "@/lib/linkify";

  describe("splitGlossaryText", () => {
    it("links an exact glossary term", () => {
      const parts = splitGlossaryText("Antihmota exploduje.");
      const linked = parts.find((p) => p.id !== undefined);
      expect(linked?.text).toBe("Antihmota");
      expect(linked?.id).toBe("antihmota");
    });

    it("does not match inside a longer word", () => {
      // "data" is a glossary term; "database" must not be linked
      const parts = splitGlossaryText("Moje database je velká.");
      expect(parts.every((p) => p.id === undefined)).toBe(true);
    });

    it("returns the original text intact when concatenated", () => {
      const src = "Rušičky ovlivňují kopírování dat.";
      expect(splitGlossaryText(src).map((p) => p.text).join("")).toBe(src);
    });
  });
  ```

  `src/components/__tests__/rule-text.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { RuleText } from "@/components/rule-text";

  describe("RuleText", () => {
    it("opens the glossary term when a linked keyword is tapped", async () => {
      const user = userEvent.setup();
      render(
        <TermSheetProvider>
          <RuleText>Antihmota se odjistí.</RuleText>
        </TermSheetProvider>,
      );
      await user.click(screen.getByRole("button", { name: "Antihmota" }));
      expect(screen.getByRole("dialog", { name: "Antihmota" })).toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/linkify` and `@/components/rule-text` do not exist.

- [ ] **Implement `src/lib/linkify.ts`** (complete, no placeholders):
  ```ts
  import { glossary } from "@/data";

  export type TextPart = { text: string; id?: string };

  const entries = glossary
    .map((g) => ({ id: g.id, name: g.nameCs }))
    .sort((a, b) => b.name.length - a.name.length);

  const idByLowerName = new Map<string, string>(
    entries.map((e) => [e.name.toLowerCase(), e.id]),
  );

  const escaped = entries.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");

  export function splitGlossaryText(text: string): TextPart[] {
    const parts: TextPart[] = [];
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      const idx = match.index;
      const matched = match[0];
      if (idx > last) parts.push({ text: text.slice(last, idx) });
      const id = idByLowerName.get(matched.toLowerCase());
      parts.push(id !== undefined ? { text: matched, id } : { text: matched });
      last = idx + matched.length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
  }
  ```

- [ ] **Implement `src/components/rule-text.tsx`** (complete, no placeholders):
  ```tsx
  "use client";

  import { Fragment } from "react";
  import { useTermSheet } from "@/components/term-sheet";
  import { splitGlossaryText } from "@/lib/linkify";

  export function RuleText({ children }: { children: string }) {
    const { openTerm } = useTermSheet();
    const parts = splitGlossaryText(children);
    return (
      <>
        {parts.map((part, i) =>
          part.id !== undefined ? (
            <button
              key={i}
              type="button"
              onClick={() => openTerm(part.id as string)}
              className="underline decoration-dotted underline-offset-2"
            >
              {part.text}
            </button>
          ) : (
            <Fragment key={i}>{part.text}</Fragment>
          ),
        )}
      </>
    );
  }
  ```

- [ ] **Apply `RuleText` in `src/components/character-dossier.tsx`** — wrap these free-text fields
  (leave ability NAMES, agenda titles, headings plain):
  - `AbilityRow`: the `<p>` rendering `ability.text` → `<p ...><RuleText>{ability.text}</RuleText></p>`
  - Agenda `<li>`: wrap `ag.text` → `… — <RuleText>{ag.text}</RuleText>`
  - Bonus points `<p>` → `<RuleText>{c.bonusPoints}</RuleText>`
  - Each edge-case `<li>{e}</li>` → `<li><RuleText>{e}</RuleText></li>`
  - Each tip `<li>{t}</li>` → `<li><RuleText>{t}</RuleText></li>`
  - Setup `<p>` → `<RuleText>{c.setup}</RuleText>`
  (Add `import { RuleText } from "@/components/rule-text";`.)

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — linkify unit tests + RuleText opens the sheet; all prior tests still green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; all routes still export.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. (`part.id as string` is inside the
  `part.id !== undefined` branch — acceptable narrowing helper, not `as any`. Prefer extracting to a
  `const id = part.id;` const if cleaner.)
- Do not modify data / `src/data/*`. Do not edit `term-sheet.tsx` (avoid the circular import).
- Keep ALL existing tests passing. If wrapping a dossier field splits a string that an existing test
  asserts via `getByText`, fix the rendering wrap (do not weaken data); the known-asserted edge case
  ("Mina nereaguje na Entropický přízrak …") contains no glossary term and must stay intact.

## 5. Acceptance Criteria

1. `pnpm test` passes — linkify unit tests, RuleText opens sheet, all prior suites green.
2. `pnpm lint` zero warnings; `pnpm build` exports all routes.
3. In a built `/postavy/<id>` page, keyword spans render as buttons (e.g. a character whose ability
   text contains "blackout"/"rušičky"); tapping opens the term sheet at runtime.
4. Report written to `docs/blueprint/reports/report_007.md`.
