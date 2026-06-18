# TASK 020: FAQ deep-links — open specific question via URL hash

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Search results of type `"faq"` currently link to `/pruvodci` (the whole page). Make them link to
`/pruvodci#faq-<id>` and imperatively open the targeted `<details>` element when the page loads or
when the hash changes — without any framework router dependency.

## 2. Files

- Modify: `src/components/faq-list.tsx` (add `id` to each `<details>`; add `useEffect` for hash opening)
- Modify: `src/app/hledat/page.tsx` (update `hrefFor` for the `"faq"` branch only)
- Modify: `src/components/__tests__/faq-list.test.tsx` (add hash-open test)

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — append to `src/components/__tests__/faq-list.test.tsx`:
  ```tsx
  it("opens the targeted question from the URL hash", () => {
    window.location.hash = "#faq-jak-anihilovat-antihmotu";
    const { container } = render(
      <TermSheetProvider>
        <FaqList faq={faq} />
      </TermSheetProvider>,
    );
    const details = container.querySelector("#faq-jak-anihilovat-antihmotu");
    expect(details).toBeInstanceOf(HTMLDetailsElement);
    expect((details as HTMLDetailsElement).open).toBe(true);
    window.location.hash = "";
  });
  ```
  Note: `as HTMLDetailsElement` is acceptable in test code (it is not `as any`). Production code must
  use `instanceof` guards instead of type assertions.

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `<details>` has no `id`; the element is not found / `open` is `false`.

- [ ] **Implement changes in `src/components/faq-list.tsx`** (complete, no placeholders):

  Add `useEffect` to the existing imports:
  ```tsx
  import { useState, useEffect } from "react";
  ```

  Add the hash-open effect inside `FaqList`, before the `return` statement:
  ```tsx
  useEffect(() => {
    function openFromHash() {
      const hash = window.location.hash;
      if (!hash.startsWith("#faq-")) return;
      const el = document.getElementById(hash.slice(1));
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        if (typeof el.scrollIntoView === "function") el.scrollIntoView();
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  ```

  Add `id` to each `<details>` element (change the existing line):
  ```tsx
  <details
    id={`faq-${entry.id}`}
    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
  >
  ```

  Full updated `src/components/faq-list.tsx` for reference:
  ```tsx
  "use client";

  import { useState, useEffect } from "react";
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

    useEffect(() => {
      function openFromHash() {
        const hash = window.location.hash;
        if (!hash.startsWith("#faq-")) return;
        const el = document.getElementById(hash.slice(1));
        if (el instanceof HTMLDetailsElement) {
          el.open = true;
          if (typeof el.scrollIntoView === "function") el.scrollIntoView();
        }
      }
      openFromHash();
      window.addEventListener("hashchange", openFromHash);
      return () => window.removeEventListener("hashchange", openFromHash);
    }, []);

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
                <details
                  id={`faq-${entry.id}`}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
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

- [ ] **Update `hrefFor` in `src/app/hledat/page.tsx`** — change only the `"faq"` branch; leave
  `"character"`, `"flow"`, `"projectx"` and the `"glossary"` button path untouched:
  ```ts
  function hrefFor(r: SearchResult): string {
    if (r.type === "character") return `/postavy/${r.id}`;
    if (r.type === "flow") return `/pruvodci/${r.id}`;
    if (r.type === "faq") return `/pruvodci#faq-${r.id}`;
    return "/pruvodci";
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — hash test opens the correct `<details>`; all prior tests still green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports successfully.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore` in production code. Use `instanceof HTMLDetailsElement`
  guards — never type assertions — in `faq-list.tsx`. (`as HTMLDetailsElement` is acceptable in test
  code only.)
- Do not modify `src/data/*`, `term-sheet.tsx`, or `term-sheet*.tsx`.
- Do not change the `"character"`, `"flow"`, `"projectx"`, or `"glossary"` branches in `hrefFor`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes — new hash test opens the targeted `<details>`; all prior tests green.
2. `pnpm lint` zero warnings; `pnpm build` exports without errors.
3. A search result of type `"faq"` links to `/pruvodci#faq-<id>` and opens the correct question on
   page load (and on `hashchange`).
4. `scrollIntoView` call is guarded (`typeof el.scrollIntoView === "function"`).
5. Report written to `docs/blueprint/reports/report_020.md`.
