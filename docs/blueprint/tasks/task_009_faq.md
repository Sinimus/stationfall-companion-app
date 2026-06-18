# TASK 009: Causality Q&A (FAQ) list

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Add the 31 causality Q&A to the `/pruvodci` page: an expandable, filterable list where each answer
is keyword-cross-linked (RuleText) and shows rule refs, source provenance and related links.

## 2. Files

- Create: `src/components/faq-list.tsx` + `src/components/__tests__/faq-list.test.tsx`
- Modify: `src/app/pruvodci/page.tsx` (add "Otázky & kauzality" section)

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/components/__tests__/faq-list.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { faq } from "@/data";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { FaqList } from "@/components/faq-list";

  function renderList() {
    render(
      <TermSheetProvider>
        <FaqList faq={faq} />
      </TermSheetProvider>,
    );
  }

  describe("FaqList", () => {
    it("renders questions", () => {
      renderList();
      expect(screen.getByText("Jak anihilovat antihmotu?")).toBeInTheDocument();
    });

    it("filters by query (question text or tags)", async () => {
      const user = userEvent.setup();
      renderList();
      await user.type(screen.getByRole("searchbox"), "kamery");
      expect(screen.getByText("Jak zapnout/vypnout kamery?")).toBeInTheDocument();
      expect(screen.queryByText("Jak anihilovat antihmotu?")).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/faq-list` does not exist.

- [ ] **Implement `src/components/faq-list.tsx`** (complete, no placeholders):
  ```tsx
  "use client";

  import { useState } from "react";
  import Link from "next/link";
  import type { FaqEntry } from "@/data";
  import { characterIds } from "@/data";
  import { useTermSheet } from "@/components/term-sheet";
  import { RuleText } from "@/components/rule-text";
  import { glossaryById, characterNameById } from "@/lib/lookups";

  function matches(entry: FaqEntry, q: string): boolean {
    const needle = q.toLowerCase();
    if (entry.question.toLowerCase().includes(needle)) return true;
    return (entry.tags ?? []).some((t) => t.toLowerCase().includes(needle));
  }

  export function FaqList({ faq }: { faq: FaqEntry[] }) {
    const { openTerm } = useTermSheet();
    const [query, setQuery] = useState("");
    const visible = query.trim() === "" ? faq : faq.filter((e) => matches(e, query.trim()));

    return (
      <div className="space-y-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat v Q&A…"
          aria-label="Hledat v Q&A"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />

        {visible.length === 0 ? (
          <p className="text-sm text-zinc-500">Nic nenalezeno.</p>
        ) : (
          <ul className="space-y-2">
            {visible.map((entry) => (
              <li key={entry.id}>
                <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <summary className="cursor-pointer font-medium">{entry.question}</summary>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <RuleText>{entry.answer}</RuleText>
                    </p>

                    {entry.seeAlso && entry.seeAlso.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {entry.seeAlso.map((sid) => {
                          const term = glossaryById.get(sid);
                          if (term !== undefined) {
                            return (
                              <button
                                key={sid}
                                type="button"
                                onClick={() => openTerm(sid)}
                                className="text-xs underline"
                              >
                                {term.nameCs}
                              </button>
                            );
                          }
                          if (characterIds.has(sid)) {
                            return (
                              <Link key={sid} href={`/postavy/${sid}`} className="text-xs underline">
                                {characterNameById.get(sid) ?? sid}
                              </Link>
                            );
                          }
                          return (
                            <Link key={sid} href={`/pruvodci/${sid}`} className="text-xs underline">
                              {sid}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}

                    {entry.ruleRefs && entry.ruleRefs.length > 0 ? (
                      <p className="text-xs text-zinc-500">Pravidla: {entry.ruleRefs.join(", ")}</p>
                    ) : null}

                    {entry.source ? (
                      <p className="text-xs text-zinc-400">Zdroj: {entry.source}</p>
                    ) : null}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  ```

- [ ] **Add the Q&A section to `src/app/pruvodci/page.tsx`** — import `faq` and `FaqList`, and after
  the "Postupy" section add:
  ```tsx
  <section aria-label="Otázky a kauzality">
    <h2 className="mb-1 text-sm font-semibold text-zinc-500">Otázky &amp; kauzality</h2>
    <FaqList faq={faq} />
  </section>
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — questions render; search narrows by question/tags.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; `/pruvodci` exports with the Q&A list.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet.tsx`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (questions render; query filter by question + tags).
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` including the Q&A list.
3. Each answer routes through `RuleText`; seeAlso glossary terms open the sheet, character/flow links resolve; rule refs + source shown.
4. Report written to `docs/blueprint/reports/report_009.md`.
