# Roadmap — beyond MVP

MVP = Postavy, Glosář, Průvodci (flows + Q&A), Project X, inline cross-linking, search, PWA.

## Cut (will NOT be built)
- **Full / searchable rulebook** — the printed Reference Manual is in the box. The app links rule
  clauses by number (`ruleRefs`); reproducing the full text is out of scope. The app *complements*
  the physical materials, it does not replace them.
- **Section geometry / connections** — corridors, vents, locks and adjacency are on the physical
  board on the table. The app covers section *properties + actions*, not the map layout.
- **Live game-state tracking** — contradicts the read-only premise ("the table holds the state");
  would break the stateless static architecture and add undo + multi-device sync.
- **Inflected linking** — nominative (1st case) is enough (user-confirmed).
- **EN / bilingual version** — CZ-only by design (user-confirmed 2026-06-18).
- **Dark-mode toggle / theme switching** — single fixed look; no second theme (user-confirmed
  2026-06-18). (Note: a few legacy `dark:` Tailwind classes remain in components — harmless, can be
  pruned during UI/UX polish.)

## Done since the v0.1 review (2026-06-18)
- Linkify inside glossary definitions; search synonyms (aliases + curated).
- **Sections reference** (41 sections: zone, gravity, lit/dark, powered, console, escape pod, actions
  → glossary, notes) — 5th tab, reverse lookup by action. (No setup-item placement — items enter via
  characters, not fixed to sections.)
- **Project X ↔ rules cross-links** — static bidirectional ⚠ warnings + "Modifikuje" list.
- Clickable character + Project X + section names + abbreviations (HP/CP/BP/NDA).
- **8 procedural flows** (added suspicion decision tree, pod launch, Abandon Ship, end-of-minute).
- **FAQ evolution** — contextual "Výjimky (N)" accordion (reverse index over `faq.seeAlso`),
  provenance (`sourceUrl`/`harvestedAt`), harvest run → 49 Q&A.
- **`lit` completeness** — 34 lit + 7 dark sections set authoritatively (0 unknown).
- **Character-based reverse lookup** — `startItems` (glossary ids) on 9 characters; item term-sheets
  show "Startuje s ním: &lt;char&gt; (&lt;start section&gt;)" — answers "who carries a weapon, where".

## Remaining
- **UI/UX polish** *(top remaining)* — visual design, game iconography (item/category symbols),
  character art, card accents, nicer filters. The app is intentionally barebone today.
- **Deep-links** (search → specific Q&A) — minor, when needed.

## Deferred (not now)
- **BGG-forum Q&A expansion** — content is sufficient for now (49 Q&A). Runbook + ledger
  (`bgg-faq-harvest.md`, `_sources/processed-threads.json`) stay ready to resume if a gap shows up.

## Deployment gate
- Public deployment (Coolify/Hetzner) is deferred until a release intended for other players. CI
  (lint/test/build) is in place; internal/review-only for now.

## Notes
- The shipped app stays AI-free; any AI is dev-time maintenance only. The app complements the box's
  printed materials and the physical board — it does not duplicate them.
