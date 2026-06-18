# Report: 023 — Sections in search + linkify section names

**Status:** READY_FOR_REVIEW
**Date:** 2026-06-18

## Summary
Indexed sections in global search (reverse lookup: "dekontaminace" → Nádrže) and made section names
tappable in text (→ `/sekce/[id]`). Rewrote the linkify matcher with a deterministic priority
(glossary > character > projectx > section) so the shared "Okolní vesmír" name resolves to the glossary
hazard, not the section.

## TDD Cycle
- **RED** — Appended section linkify + collision tests, a rule-text section-link test, and a section
  reverse-lookup search test; ran `pnpm test`. Confirmed FAIL: section kind not matched / no section
  search results (3 failures). The collision test already passed (glossary "Okolní vesmír" pre-existed).
- **GREEN** — Rewrote the matcher, added the rule-text branch, indexed sections, wired the search type +
  routing. `pnpm test` PASS (54/54).

## Files Modified
- `src/lib/linkify.ts` — rewritten. `LinkRef.kind` union now includes `"section"`. `sources` is built in
  priority order (glossary names+aliases, characters, projectx, sections). `refByLowerName` is built
  **first-wins** (glossary dominates collisions). The regex alternation uses a deduped `uniqueNames` set
  (so "Okolní vesmír" appears once) sorted longest-first; `splitText` unchanged in shape.
- `src/components/rule-text.tsx` — added a `ref.kind === "section"` branch → `<Link href="/sekce/<id>">`.
- `src/lib/search.ts` — `ResultType` adds `"section"`; imports `sections` + `glossaryById`; indexes each
  section with body = action labels (`glossaryById.get(a)?.nameCs ?? a`) + notes (so action names match).
- `src/app/hledat/page.tsx` — `TYPE_LABEL` adds `section: "Sekce"`; `hrefFor` adds
  `if (r.type === "section") return \`/sekce/${r.id}\`` (a `<Link>`, like character/flow).
- Tests: `linkify.test.ts` (+ section linkify, + glossary-priority collision), `rule-text.test.tsx`
  (+ section link), `search.test.ts` (+ section reverse lookup).

## Collision Resolution (verified)
- The only shared name is "Okolní vesmír" (glossary hazard `okolni-vesmir` AND a section with the same
  id/name). No other section name collides with any glossary name/alias, character, or projectx; no
  duplicate lowercased section names. The first-wins `refByLowerName` (glossary listed first) makes the
  glossary ref win — confirmed by the "prefers the glossary term over the section" test.

## Pre-Implementation Risk Check (no test regressions)
Adding ~41 section names to the matcher could split asserted text. Verified the asserted RuleText-wrapped
strings contain no section names: agentka's edge case ("Mina nereaguje na …") and the antihmota definition
("/odjistí/") are clean — so the dossier and term-sheet `getByText` assertions are unaffected. All other
existing tests assert on plain fields (names/titles/labels/summaries), not on RuleText-wrapped content.

## Test Results
- `pnpm test` — PASS: 18 files, 54 tests. section linkify; "Okolní vesmír" → glossary; rule-text section
  link; search finds a section by action; all prior suites green (no linkify regression).
- `pnpm lint` — PASS: zero warnings/errors.
- `pnpm build` — PASS: all routes export.

## Acceptance Criteria Verified
1. `pnpm test` passes (section linkify, "Okolní vesmír" → glossary, rule-text section link, section
   search by action; all prior green). ✓
2. `pnpm lint` zero warnings; `pnpm build` exports all routes. ✓
3. Section names in text link to `/sekce/<id>` — 46 section-name RuleText links across built pages;
   glossary wins the shared "Okolní vesmír"; search returns sections (reverse lookup by action) routing
   to `/sekce/<id>`. ✓
4. Report written. ✓

## Constraints Verified
- No `any`/`as any`/`as string`/`@ts-ignore` — used `kind: "…" as const` for literal narrowing and
  `glossaryById.get(a)?.nameCs ?? a`. ✓
- No edits to `src/data/*` or `term-sheet*.tsx`
  (git status: only `linkify.ts`, `rule-text.tsx`, `search.ts`, `hledat/page.tsx` + 3 test files). ✓
- Matcher rewrite did not regress glossary/character/projectx linkify (no collisions among them; all
  prior tests green). ✓

## Technical Debt
- `vite-tsconfig-paths` deprecation notice still prints (carried; task spec mandates the plugin).
- The combined alternation regex now includes ~41 more names; still built once at module load. If the
  corpus grows large, a trie would scale better.
- Section name matching is exact whole-phrase (no Czech declension) — e.g. declined forms aren't linked,
  consistent with the other entity kinds.
- The "Okolní vesmír" collision is resolved deterministically, but the section with that name is now only
  reachable via `/sekce/okolni-vesmir` (search/list), never via inline linkify (glossary wins). Acceptable
  per the task's stated priority.
