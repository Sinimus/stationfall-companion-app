# TASK 017: Typed linkify + clickable character names

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Generalize the inline linkifier to return typed references and link **character names** in text to
their detail page (today only glossary terms link). Introduces the `LinkRef` type that task 018
(Project X) will extend.

## 2. Files

- Modify: `src/lib/linkify.ts` (typed refs; index character names)
- Modify: `src/lib/__tests__/linkify.test.ts` (new API + character test)
- Modify: `src/components/rule-text.tsx` (render glossary → button, character → Link)
- Modify: `src/components/__tests__/rule-text.test.tsx` (character-link test)

## 3. Implementation Steps (TDD)

- [ ] **Rewrite `src/lib/__tests__/linkify.test.ts`** to the new typed API (replace the file body;
  keep the import line style):
  ```ts
  import { describe, it, expect } from "vitest";
  import { splitText } from "@/lib/linkify";

  describe("splitText", () => {
    it("links an exact glossary term", () => {
      const linked = splitText("Antihmota exploduje.").find((p) => p.ref?.kind === "glossary");
      expect(linked?.text).toBe("Antihmota");
      expect(linked?.ref?.id).toBe("antihmota");
    });

    it("links a character name to the character kind", () => {
      const parts = splitText("Status Psance mají Pirátka a Kyborg.");
      expect(parts.some((p) => p.ref?.kind === "character" && p.ref.id === "piratka")).toBe(true);
      expect(parts.some((p) => p.ref?.kind === "character" && p.ref.id === "kyborg")).toBe(true);
    });

    it("links the HP alias to its glossary term", () => {
      const linked = splitText("Moje HP je v bezpečí.").find((p) => p.ref !== undefined);
      expect(linked?.text).toBe("HP");
      expect(linked?.ref).toEqual({ kind: "glossary", id: "hracova-postava" });
    });

    it("does not match inside a longer word", () => {
      expect(splitText("Moje database je velká.").every((p) => p.ref === undefined)).toBe(true);
    });

    it("returns the original text intact when concatenated", () => {
      const src = "Rušičky ovlivňují kopírování dat.";
      expect(splitText(src).map((p) => p.text).join("")).toBe(src);
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `splitText` does not exist (only `splitGlossaryText`).

- [ ] **Rewrite `src/lib/linkify.ts`** (complete; replaces `splitGlossaryText`):
  ```ts
  import { glossary, characters } from "@/data";

  export type LinkRef = { kind: "glossary" | "character"; id: string };
  export type TextPart = { text: string; ref?: LinkRef };

  type Entry = { ref: LinkRef; name: string };

  const entries: Entry[] = [
    ...glossary.flatMap((g) =>
      [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ ref: { kind: "glossary" as const, id: g.id }, name })),
    ),
    ...characters.map((c) => ({ ref: { kind: "character" as const, id: c.id }, name: c.nameCs })),
  ].sort((a, b) => b.name.length - a.name.length);

  const refByLowerName = new Map<string, LinkRef>(entries.map((e) => [e.name.toLowerCase(), e.ref]));
  const escaped = entries.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");

  export function splitText(text: string): TextPart[] {
    const parts: TextPart[] = [];
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      const idx = match.index;
      const matched = match[0];
      if (idx > last) parts.push({ text: text.slice(last, idx) });
      const ref = refByLowerName.get(matched.toLowerCase());
      parts.push(ref !== undefined ? { text: matched, ref } : { text: matched });
      last = idx + matched.length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
  }
  ```

- [ ] **Update `src/components/rule-text.tsx`** (glossary → sheet button, character → Link):
  ```tsx
  "use client";

  import { Fragment } from "react";
  import Link from "next/link";
  import { useTermSheet } from "@/components/term-sheet-context";
  import { splitText } from "@/lib/linkify";

  const LINK_CLASS = "underline decoration-dotted underline-offset-2";

  export function RuleText({ children }: { children: string }) {
    const { openTerm } = useTermSheet();
    return (
      <>
        {splitText(children).map((part, i) => {
          const ref = part.ref;
          if (ref === undefined) return <Fragment key={i}>{part.text}</Fragment>;
          if (ref.kind === "character") {
            return (
              <Link key={i} href={`/postavy/${ref.id}`} className={LINK_CLASS}>
                {part.text}
              </Link>
            );
          }
          return (
            <button key={i} type="button" onClick={() => openTerm(ref.id)} className={LINK_CLASS}>
              {part.text}
            </button>
          );
        })}
      </>
    );
  }
  ```

- [ ] **Add a character-link test** — append to `src/components/__tests__/rule-text.test.tsx`:
  ```tsx
  it("renders a character name as a link to its detail page", () => {
    render(
      <TermSheetProvider>
        <RuleText>Pomstí se na Pirátce? Ne — Pirátka uteče.</RuleText>
      </TermSheetProvider>,
    );
    const link = screen.getByRole("link", { name: "Pirátka" });
    expect(link).toHaveAttribute("href", "/postavy/piratka");
  });
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — glossary still opens the sheet; character names are links; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports; a built `/postavy/agentka` page links character names
  mentioned in its tips/edge cases (e.g. links to other characters).

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet*.tsx`.
- `splitGlossaryText` is renamed to `splitText`; ensure no other file still imports the old name
  (only `rule-text.tsx` and the linkify test use it).
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (typed `splitText`: glossary + character refs; HP alias; rule-text char link).
2. `pnpm lint` zero warnings; `pnpm build` exports all routes.
3. Character names in any rendered text link to `/postavy/<id>`; glossary keywords still open the sheet.
4. Report written to `docs/blueprint/reports/report_017.md`.
