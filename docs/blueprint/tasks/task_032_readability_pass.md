# TASK 032: Readability pass — apply <Prose> to all long-text surfaces

> **Status:** DONE
> **Assigned to:** Constructor (Sonnet sub-agent)

## 1. Goal

Per the design brief: *"no run-together paragraphs / sentences forming a block of text; readable;
mobile-first."* The worst offenders are glossary definitions (110 entries, many >160 chars) and FAQ
answers (up to 585 chars), today rendered as a dense `<p className="text-sm">`.

Wrap every **primary reading body** in the `<Prose>` primitive from task_030 (constrained reading
measure ≈ 65ch + relaxed leading, inheriting the 15px body size instead of the smaller `text-sm`).
This is a **typography-only** change — NO data is restructured (user-confirmed approach). Meta lines
(rule refs, sources, see-also chips) stay small and unchanged.

> `Prose` already exists (`src/components/prose.tsx`): `<div className="measure leading-relaxed …">`.
> It carries NO font-size, so it must NOT sit inside a `text-sm` wrapper for the body to read at 15px
> — where a wrapper forces `text-sm`, this task removes it (the meta children keep their explicit
> `text-xs`).

## 2. Files

- Modify: `src/components/term-sheet.tsx` (glossary definition + Project X text)
- Modify: `src/components/faq-list.tsx` (answer)
- Modify: `src/components/faq-accordion.tsx` (answer)
- Modify: `src/components/character-dossier.tsx` (ability text, setup, bonusPoints, edge/tips leading)
- Modify: `src/components/flow-view.tsx` (intro + step body)
- Modify: `src/components/section-detail.tsx` (notes)
- Modify: `src/components/__tests__/term-sheet.test.tsx` (assert definition uses `measure`)
- Modify: `src/components/__tests__/faq-accordion.test.tsx` (assert answer uses `measure`)

Each file gets `import { Prose } from "@/components/prose";` added with the other imports.

## 3. Implementation Steps (TDD)

- [ ] **Add failing assertions first.**

  In `src/components/__tests__/term-sheet.test.tsx`, add inside the existing `describe`:
  ```tsx
  it("renders the definition in a constrained reading measure", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    expect(dialog.querySelector(".measure")).not.toBeNull();
  });
  ```

  In `src/components/__tests__/faq-accordion.test.tsx`, add inside the existing `describe`
  (the accordion is collapsed `<details>`; query the DOM directly, no need to open it):
  ```tsx
  it("renders the answer in a constrained reading measure", () => {
    const { container } = render(
      <TermSheetProvider>
        <FaqAccordion targetId="nanogel" />
      </TermSheetProvider>,
    );
    expect(container.querySelector(".measure")).not.toBeNull();
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — no `.measure` element yet in the definition / answer.

- [ ] **`src/components/term-sheet.tsx`** — glossary definition:
  ```tsx
  <p className="text-sm">
    <RuleText>{term.text}</RuleText>
  </p>
  ```
  →
  ```tsx
  <Prose>
    <RuleText>{term.text}</RuleText>
  </Prose>
  ```
  And the Project X branch — change the wrapper `<div className="space-y-2 text-sm">` to
  `<div className="space-y-2">`, and wrap the project text:
  ```tsx
  <p>
    <RuleText>{project.text}</RuleText>
  </p>
  ```
  →
  ```tsx
  <Prose>
    <RuleText>{project.text}</RuleText>
  </Prose>
  ```
  (Leave the `trigger` line as `text-xs` — it stays small.)

- [ ] **`src/components/faq-list.tsx`** — change the answer wrapper `<div className="mt-2 space-y-2
  text-sm">` to `<div className="mt-2 space-y-2">`, and:
  ```tsx
  <p>
    <RuleText>{entry.answer}</RuleText>
  </p>
  ```
  →
  ```tsx
  <Prose>
    <RuleText>{entry.answer}</RuleText>
  </Prose>
  ```
  (The see-also chips, rule refs and source already carry explicit `text-xs` — unchanged.)

- [ ] **`src/components/faq-accordion.tsx`** — the answer:
  ```tsx
  <p className="text-zinc-600 dark:text-zinc-300">
    <RuleText>{entry.answer}</RuleText>
  </p>
  ```
  →
  ```tsx
  <Prose className="text-zinc-300">
    <RuleText>{entry.answer}</RuleText>
  </Prose>
  ```

- [ ] **`src/components/character-dossier.tsx`**:
  - AbilityRow body:
    ```tsx
    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300"><RuleText>{ability.text}</RuleText></p>
    ```
    →
    ```tsx
    <Prose className="mt-1 text-zinc-300"><RuleText>{ability.text}</RuleText></Prose>
    ```
  - "Příprava hry" setup:
    ```tsx
    <p className="text-sm"><RuleText>{c.setup}</RuleText></p>
    ```
    →
    ```tsx
    <Prose><RuleText>{c.setup}</RuleText></Prose>
    ```
  - "Bonusové body":
    ```tsx
    <p className="text-sm"><RuleText>{c.bonusPoints}</RuleText></p>
    ```
    →
    ```tsx
    <Prose><RuleText>{c.bonusPoints}</RuleText></Prose>
    ```
  - "Zvláštnosti" and "Tipy" stay bulleted, but add `leading-relaxed` for breathing room: change
    both `<ul className="list-disc space-y-1 pl-5 text-sm">` to
    `<ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">`.

- [ ] **`src/components/flow-view.tsx`**:
  - intro:
    ```tsx
    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
      <RuleText>{flow.intro}</RuleText>
    </p>
    ```
    →
    ```tsx
    <Prose className="mt-1 text-zinc-300">
      <RuleText>{flow.intro}</RuleText>
    </Prose>
    ```
  - step body:
    ```tsx
    <p className="mt-1 text-sm">
      <RuleText>{step.body}</RuleText>
    </p>
    ```
    →
    ```tsx
    <Prose className="mt-1">
      <RuleText>{step.body}</RuleText>
    </Prose>
    ```

- [ ] **`src/components/section-detail.tsx`** — notes:
  ```tsx
  <p className="text-sm">
    <RuleText>{s.notes}</RuleText>
  </p>
  ```
  →
  ```tsx
  <Prose>
    <RuleText>{s.notes}</RuleText>
  </Prose>
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — the two new `.measure` assertions + all prior green (the existing term-sheet /
  faq / dossier / flow / section tests still find their text; `<Prose>` renders a `<div>` wrapper,
  which does not change `getByText` lookups).

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. Long definitions/answers now read at 15px with relaxed
  leading and a ≈65ch measure; meta lines stay small.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do NOT edit any `src/data/*` file (typography only).
- Do not change wording or data; only the rendering wrappers/classes described above.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (two new `.measure` assertions; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. Glossary definitions, FAQ answers (list + accordion), ability text, flow intro/steps, section notes,
   character setup & bonus all render via `<Prose>` (≈65ch measure, relaxed leading, 15px reading
   size); no primary reading body is a dense `text-sm` slab anymore.
4. Report written to `docs/blueprint/reports/report_032.md`.
