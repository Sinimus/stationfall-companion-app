# Report 032: Readability pass — apply `<Prose>` to all long-text surfaces

**Status:** DONE  
**Task:** `docs/blueprint/tasks/task_032_readability_pass.md`

## Files changed

### `src/components/__tests__/term-sheet.test.tsx`
Added new test: `"renders the definition in a constrained reading measure"` — opens the "Antihmota" term sheet, asserts `dialog.querySelector(".measure")` is not null.

### `src/components/__tests__/faq-accordion.test.tsx`
Added new test: `"renders the answer in a constrained reading measure"` — renders `<FaqAccordion targetId="nanogel" />`, asserts `container.querySelector(".measure")` is not null.

### `src/components/term-sheet.tsx`
- Added `import { Prose } from "@/components/prose";`
- Glossary definition: `<p className="text-sm">` wrapper replaced with `<Prose>`
- Project X branch wrapper: `<div className="space-y-2 text-sm">` → `<div className="space-y-2">`
- Project X text: `<p>` wrapper replaced with `<Prose>`

### `src/components/faq-accordion.tsx`
- Added `import { Prose } from "@/components/prose";`
- Answer: `<p className="text-zinc-600 dark:text-zinc-300">` → `<Prose className="text-zinc-300">`

### `src/components/faq-list.tsx`
- Added `import { Prose } from "@/components/prose";`
- Answer wrapper: `<div className="mt-2 space-y-2 text-sm">` → `<div className="mt-2 space-y-2">`
- Answer paragraph: `<p>` → `<Prose>`

### `src/components/character-dossier.tsx`
- Added `import { Prose } from "@/components/prose";`
- AbilityRow body: `<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">` → `<Prose className="mt-1 text-zinc-300">`
- Setup: `<p className="text-sm">` → `<Prose>`
- Bonus points: `<p className="text-sm">` → `<Prose>`
- Zvlaštnosti `<ul>`: added `leading-relaxed` to className
- Tipy `<ul>`: added `leading-relaxed` to className

### `src/components/flow-view.tsx`
- Added `import { Prose } from "@/components/prose";`
- Intro: `<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">` → `<Prose className="mt-1 text-zinc-300">`
- Step body: `<p className="mt-1 text-sm">` → `<Prose className="mt-1">`

### `src/components/section-detail.tsx`
- Added `import { Prose } from "@/components/prose";`
- Notes: `<p className="text-sm">` → `<Prose>`

## Test output

```
Test Files  24 passed (24)
     Tests  73 passed (73)
  Duration  2.42s
```

Two new `.measure` assertions pass; all 71 prior tests continue to pass.

## Lint output

```
> eslint
(zero warnings, zero errors)
```

## Build output

```
Compiled successfully in 1196ms
Generating static pages using 9 workers (87/87) in 171ms
```

Exported 87 pages. Zero TypeScript errors. Zero warnings.

## Deviations

None. All edits match the task spec exactly.
