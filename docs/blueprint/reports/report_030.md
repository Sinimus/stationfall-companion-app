# Report 030: Typography foundation — fixed dark theme + Inter + reading rhythm

**Status:** COMPLETE  
**Task:** task_030_typo_foundation.md

## Files Changed

### Created
- `src/components/prose.tsx` — New `<Prose>` presentational primitive. Renders a `<div>` with `measure leading-relaxed` classes and optional className merging. Strict TypeScript (ReactNode, no any).
- `src/components/__tests__/prose.test.tsx` — Two vitest tests: renders with `measure` + `leading-relaxed` classes; merges extra `className`.

### Modified
- `src/app/layout.tsx` — Added `Inter` import from `next/font/google`; instantiated with `subsets: ["latin", "latin-ext"]`, `variable: "--font-inter"`, `display: "swap"`; updated `<html>` tag to `className={\`dark ${inter.variable}\`}`.
- `src/app/globals.css` — Full rewrite: replaced media-query dark variant with `@custom-variant dark (&:where(.dark, .dark *))` (class-based, permanent); removed light `:root` values; set fixed dark `:root` (`--background: #0a0a0a`, `--foreground: #ededed`); wired `--font-inter` in `@theme inline`; added body reading rhythm (15px / 1.6); added `@utility measure { max-width: 65ch; }`; kept all six category colors unchanged.

## Test Results

```
Test Files  24 passed (24)
     Tests  69 passed (69)
  Duration  2.43s
```
(+2 new tests: Prose render/merge; all 67 prior tests remain green)

## Lint Results

```
> eslint
(zero warnings, zero errors)
```

## Build Results

```
Compiled successfully in 1193ms
Generating static pages using 9 workers (87/87) in 170ms
```
Exported 87 static pages. TypeScript check passed. No build warnings.

## Deviations

None. Implementation matches the task specification verbatim.
