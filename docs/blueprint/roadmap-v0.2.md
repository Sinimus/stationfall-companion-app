# Roadmap — v0.2 backlog

Deferred from MVP by decision (2026-06-18). MVP completion = Projekty X UI + PWA/offline + deploy.

## UX / visual
- **UI/UX polish** — shadcn/ui, typography scale, game iconography (item/category symbols),
  character art, card accents, nicer filters. (MVP is intentionally barebone.)
- **Dark-mode toggle** — currently follows system only.

## Content / features
- **Sections reference** — a structured "what can I do in this section" view (section actions by
  board location). Today section/console actions are only scattered glossary entries. New data model
  (sections → actions).
- **Linkify inside glossary definitions** — RuleText within term-sheet definition text (needs the
  TermSheet context extracted to its own module to avoid the circular import).
- **BGG FAQ expansion** — grow `faq.json` from the rules forum per `bgg-faq-harvest.md` (runbook +
  `processed-threads.json` ledger ready).
- **Searchable full rulebook** — index the numbered reference clauses (only `ruleRefs` are linked now).
- **Live game-state tracking** — track downed/escaped, minute marker, contextual hints.
- **EN / bilingual** — content is CZ-only.

## Smaller polish
- **Deep-links** — search result → specific Q&A / a Project X detail route (today FAQ & Project X
  results land on `/pruvodci`).
- **Inflected linking** — match declined forms (e.g. "Okolního vesmíru"). Deprioritized — user
  confirmed nominative (1st case) is enough.

## Notes
- The shipped app stays AI-free; any AI is dev-time maintenance only.
