# Roadmap — beyond MVP

MVP = Postavy, Glosář, Průvodci (flows + Q&A), Project X, inline cross-linking, search, PWA.
Priorities below reflect the v0.1 design review (2026-06-18).

## Cut (will NOT be built)
- **Live game-state tracking** — removed. It contradicts the read-only premise ("the table holds
  the state"), would break the stateless static architecture, and adds undo + multi-device sync
  complexity. The app stays a deterministic, read-only oracle.
- **Inflected linking** — deprioritized; user confirmed nominative (1st case) is enough.

## Near-term quick wins (v0.1.x)
- **Linkify inside glossary definitions** — make keywords tappable within a term's definition text
  in the bottom-sheet (avoids dead-ends). Blocker was a circular import; fix by extracting the
  TermSheet context to its own module so `RuleText` can be used in the sheet. *Small, high value.*
- **Search synonyms** — index glossary `aliases` into search and add curated synonyms to key terms
  (e.g. "zbraň" → Hasák/Pistole, "kamera"), so non-matching synonyms still find the right entry.
  Reuses the existing `aliases` mechanism for both linkify and search. *Small, high value.*

## v0.2 priorities
- **Sections / board reference** *(headline)* — a new data model (sections → gravity, lit/dark,
  available section/console actions, items at setup) enabling reverse lookup: "what can I do in
  Medbay?", "where do I find a weapon / camera?". The board is effectively another player.
- **Project X ↔ rules cross-links** — static, bidirectional: on an affected rule/term show
  "⚠ modified by Project X: …" with a link (NOT active-state detection — that would need state).
  Requires authoring the Project-X → rules mapping.
- **UI/UX polish** — visual design, game iconography (item/category symbols), character art, card
  accents, nicer filters. (MVP is intentionally barebone.)

## Later / when needed
- **BGG-forum Q&A expansion** — grow `faq.json` per `bgg-faq-harvest.md` (runbook + ledger ready).
- **Searchable full rulebook** — index the numbered reference clauses (only `ruleRefs` linked now).
- **EN / bilingual** — content is CZ-only.
- **Dark-mode toggle** — currently follows system.
- **Deep-links** — search result → specific Q&A / Project X detail route.

## Deployment gate
- Public deployment (Coolify/Hetzner) is **deferred until a release intended for other players**.
  CI (lint/test/build) is in place; the MVP is internal/review-only, not published.

## Notes
- The shipped app stays AI-free; any AI is dev-time maintenance only.
