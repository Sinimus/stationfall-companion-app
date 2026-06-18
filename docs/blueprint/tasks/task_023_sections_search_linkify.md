# TASK 023: Sections in search + linkify section names

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Index sections in global search (reverse lookup: "dekontaminace" → Nádrže) and make section names
tappable in text (→ `/sekce/[id]`). Resolve the "Okolní vesmír" name collision (it is both a
glossary hazard and a section) with a deterministic priority: glossary wins.

## 2. Files

- Modify: `src/lib/linkify.ts` (add `"section"` kind; priority-ordered matcher) + `src/lib/__tests__/linkify.test.ts`
- Modify: `src/components/rule-text.tsx` (section → Link) + `src/components/__tests__/rule-text.test.tsx`
- Modify: `src/lib/search.ts` (index sections) + `src/lib/__tests__/search.test.ts`
- Modify: `src/app/hledat/page.tsx` (section result → `/sekce/[id]`)

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  Append to `src/lib/__tests__/linkify.test.ts`:
  ```ts
  it("links a section name to the section kind", () => {
    const parts = splitText("Postava startuje v sekci Apartmá.");
    expect(parts.some((p) => p.ref?.kind === "section" && p.ref.id === "apartma")).toBe(true);
  });

  it("prefers the glossary term over the section for a shared name", () => {
    const linked = splitText("Okolní vesmír je nebezpečný.").find((p) => p.ref !== undefined);
    expect(linked?.ref).toEqual({ kind: "glossary", id: "okolni-vesmir" });
  });
  ```

  Append to `src/components/__tests__/rule-text.test.tsx`:
  ```tsx
  it("renders a section name as a link to its page", () => {
    render(
      <TermSheetProvider>
        <RuleText>Přesun do sekce Můstek.</RuleText>
      </TermSheetProvider>,
    );
    expect(screen.getByRole("link", { name: "Můstek" })).toHaveAttribute("href", "/sekce/mustek");
  });
  ```

  Append to `src/lib/__tests__/search.test.ts`:
  ```ts
  it("finds a section by its action (reverse lookup)", () => {
    expect(search("dekontaminace").some((r) => r.type === "section" && r.id === "nadrze")).toBe(true);
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — section kind not matched; no section search results.

- [ ] **Rewrite the matcher in `src/lib/linkify.ts`** (add sections + deterministic priority):
  ```ts
  import { glossary, characters, projectsX, sections } from "@/data";

  export type LinkRef = { kind: "glossary" | "character" | "projectx" | "section"; id: string };
  export type TextPart = { text: string; ref?: LinkRef };

  type Entry = { ref: LinkRef; name: string };

  // Priority order (first wins on a shared name): glossary > character > projectx > section.
  const sources: Entry[] = [
    ...glossary.flatMap((g) =>
      [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ ref: { kind: "glossary" as const, id: g.id }, name })),
    ),
    ...characters.map((c) => ({ ref: { kind: "character" as const, id: c.id }, name: c.nameCs })),
    ...projectsX.map((p) => ({ ref: { kind: "projectx" as const, id: p.id }, name: p.nameCs })),
    ...sections.map((s) => ({ ref: { kind: "section" as const, id: s.id }, name: s.nameCs })),
  ];

  const refByLowerName = new Map<string, LinkRef>();
  for (const e of sources) {
    const key = e.name.toLowerCase();
    if (!refByLowerName.has(key)) refByLowerName.set(key, e.ref);
  }

  const uniqueNames = [...new Set(sources.map((e) => e.name))].sort((a, b) => b.length - a.length);
  const escaped = uniqueNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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

- [ ] **Add the section branch in `src/components/rule-text.tsx`** — after the character branch:
  ```tsx
  if (ref.kind === "section") {
    return (
      <Link key={i} href={`/sekce/${ref.id}`} className={LINK_CLASS}>
        {part.text}
      </Link>
    );
  }
  ```

- [ ] **Index sections in `src/lib/search.ts`**:
  - Add `"section"` to the `ResultType` union.
  - Extend imports: `import { characters, glossary, faq, flows, projectsX, sections } from "@/data";`
    and `import { glossaryById } from "@/lib/lookups";`
  - After the Project X loop, add (body = action labels + notes so "dekontaminace"/"výroba" match):
    ```ts
    for (const s of sections) {
      const actionNames = s.actions.map((a) => glossaryById.get(a)?.nameCs ?? a).join(" ");
      add("section", s.id, s.nameCs, `${actionNames} ${s.notes ?? ""}`);
    }
    ```

- [ ] **Handle the section type in `src/app/hledat/page.tsx`**:
  - `TYPE_LABEL` add `section: "Sekce"`.
  - In `hrefFor` add `if (r.type === "section") return `/sekce/${r.id}`;` (a `<Link>`, like character/flow).

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — section linkify + glossary-priority collision; rule-text section link; search finds
  a section by action; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports all routes.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `as string`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet*.tsx`.
- Keep all existing tests passing (the matcher rewrite must not regress glossary/character/projectx linkify).

## 5. Acceptance Criteria

1. `pnpm test` passes (section linkify, "Okolní vesmír" → glossary, rule-text section link, section
   search by action; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports all routes.
3. Section names in any text link to `/sekce/<id>`; the glossary term wins the shared "Okolní vesmír";
   search returns sections (reverse lookup by action), routing to `/sekce/<id>`.
4. Report written to `docs/blueprint/reports/report_023.md`.
