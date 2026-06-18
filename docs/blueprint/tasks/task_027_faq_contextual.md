# TASK 027: Contextual FAQ surfacing + provenance fields

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Surface relevant Q&A on the entities they relate to (progressive disclosure): a collapsed
"Specifické interakce a výjimky (N)" accordion on glossary terms (sheet), characters (dossier) and
sections (detail), driven by a reverse index over `faq.seeAlso`. Add optional provenance fields to
`FaqEntry` for auditability.

> `faq.seeAlso` already links each Q&A to glossary/character/flow/section ids — it IS the relational
> tag system, so no new tagging vocabulary is needed.

## 2. Files

- Modify: `src/data/schema.ts` (add `sourceUrl` / `harvestedAt` to `FaqEntry`)
- Modify: `src/data/schemas.ts` (same on `faqEntrySchema`)
- Create: `src/lib/faq.ts` (reverse index) + `src/lib/__tests__/faq.test.ts`
- Create: `src/components/faq-accordion.tsx` + `src/components/__tests__/faq-accordion.test.tsx`
- Modify: `src/components/term-sheet.tsx` (glossary branch), `src/components/character-dossier.tsx`,
  `src/components/section-detail.tsx` (render the accordion)

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  `src/lib/__tests__/faq.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { faqFor } from "@/lib/faq";

  describe("faqFor", () => {
    it("returns Q&A whose seeAlso references the target", () => {
      expect(faqFor("nanogel").some((e) => e.id === "revive-vyzaduje-kolokaci")).toBe(true);
    });
    it("returns empty for a target with no related Q&A", () => {
      expect(faqFor("nonexistent-xyz")).toEqual([]);
    });
  });
  ```

  `src/components/__tests__/faq-accordion.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { FaqAccordion } from "@/components/faq-accordion";

  describe("FaqAccordion", () => {
    it("lists related Q&A with a count", () => {
      render(
        <TermSheetProvider>
          <FaqAccordion targetId="nanogel" />
        </TermSheetProvider>,
      );
      expect(screen.getByText(/Specifické interakce a výjimky/)).toBeInTheDocument();
      expect(screen.getByText("Vyžaduje akce Oživení kolokaci (stejnou sekci)?")).toBeInTheDocument();
    });
    it("renders nothing when there is no related Q&A", () => {
      render(
        <TermSheetProvider>
          <FaqAccordion targetId="nonexistent-xyz" />
        </TermSheetProvider>,
      );
      expect(screen.queryByText(/Specifické interakce a výjimky/)).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/lib/faq` and `@/components/faq-accordion` do not exist.

- [ ] **Add provenance to `src/data/schema.ts`** — in `FaqEntry`:
  ```ts
  /** URL zdrojového BGG vlákna (auditovatelnost). */
  sourceUrl?: string;
  /** Datum sklizně (YYYY-MM-DD). */
  harvestedAt?: string;
  ```

- [ ] **Add provenance to `src/data/schemas.ts`** — in `faqEntrySchema` (before `.strict()`):
  ```ts
  sourceUrl: z.string().optional(),
  harvestedAt: z.string().optional(),
  ```

- [ ] **Implement `src/lib/faq.ts`**:
  ```ts
  import { faq, type FaqEntry } from "@/data";

  const index = new Map<string, FaqEntry[]>();
  for (const entry of faq) {
    for (const id of entry.seeAlso ?? []) {
      const list = index.get(id) ?? [];
      list.push(entry);
      index.set(id, list);
    }
  }

  export function faqFor(targetId: string): FaqEntry[] {
    return index.get(targetId) ?? [];
  }
  ```

- [ ] **Implement `src/components/faq-accordion.tsx`** (client; collapsed by default = progressive disclosure):
  ```tsx
  "use client";

  import { faqFor } from "@/lib/faq";
  import { RuleText } from "@/components/rule-text";

  export function FaqAccordion({ targetId }: { targetId: string }) {
    const entries = faqFor(targetId);
    if (entries.length === 0) return null;
    return (
      <details className="mt-3 rounded-md border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer p-2 text-sm font-medium">
          Specifické interakce a výjimky ({entries.length})
        </summary>
        <ul className="space-y-2 p-2 pt-0 text-sm">
          {entries.map((entry) => (
            <li key={entry.id}>
              <p className="font-medium">{entry.question}</p>
              <p className="text-zinc-600 dark:text-zinc-300">
                <RuleText>{entry.answer}</RuleText>
              </p>
            </li>
          ))}
        </ul>
      </details>
    );
  }
  ```

- [ ] **Wire `FaqAccordion`**:
  - `src/components/term-sheet.tsx`: in the glossary branch (`term !== null`), after the
    `ProjectXWarning`, add `<FaqAccordion targetId={term.id} />`. Add the import.
  - `src/components/character-dossier.tsx`: after the existing `ProjectXWarning`, add
    `<FaqAccordion targetId={c.id} />`. Add the import.
  - `src/components/section-detail.tsx`: after the notes section, add `<FaqAccordion targetId={s.id} />`.
    Add the import.

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — reverse index + accordion render/empty; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. A built page whose entity has related Q&A shows the
  collapsed accordion (e.g. the Nanogel term, or characters/sections referenced by a Q&A's seeAlso).

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit data files.
- `FaqAccordion` uses `RuleText` (which imports the hook from `term-sheet-context`) — no import cycle.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (faqFor + FaqAccordion; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Glossary terms / characters / sections with related Q&A show a collapsed "výjimky (N)" accordion;
   `FaqEntry` carries optional `sourceUrl`/`harvestedAt`.
4. Report written to `docs/blueprint/reports/report_027.md`.
