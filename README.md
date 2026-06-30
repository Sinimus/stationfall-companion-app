# Stationfall Companion

A mobile-first, **offline-capable** rules companion for the board game
**[Stationfall](https://boardgamegeek.com/boardgame/316624/stationfall)** (CZ edition *“Zkáza na
orbitě”*). It helps players handle the game’s large surface of micro-rules and causal chains at the
table — fast, in Czech, and without a network connection.

> Status: **MVP** (content pillars complete; deployment is the last remaining step).
> Content language: **Czech**. The shipped app contains **no backend and no AI** — it is a static
> PWA that reads bundled, validated data.

---

## Why

Stationfall has ~28 asymmetric characters, ~50 named keyword abilities, dense edge cases, and a web
of causal systems (suspicion, blackout, antimatter, Project X, end-game scoring). At the table that
means constant rule lookups. This app turns the official rules into **structured, cross-linked,
searchable reference** so a question like *“does Revive require colocation?”* or *“how do I get rid
of antimatter?”* is one tap away.

## Features

- **Characters** (`/postavy`) — all 28 characters: a filterable grid (by type and ability category)
  and a per-character dossier (abilities, reveal abilities, agendas with point breakdown, edge cases,
  tips, setup) with category-colored ability chips.
- **Glossary** (`/glosar`) — 109 terms grouped by kind, opened in a bottom-sheet showing the
  definition, “appears on” characters, related terms (seeAlso) and rule references.
- **Guides** (`/pruvodci`) — 4 step-by-step **procedural flows** (end-game scoring, antimatter
  detonation, power/blackout, Project X), 31 curated **causality Q&A**, and the 8 **Project X** cards.
- **Inline cross-linking** — any glossary keyword inside any text (abilities, edge cases, Q&A
  answers, flow steps) is tappable and opens its definition. Abbreviations (HP/CP/BP) are matched via
  aliases. *(Killer feature.)*
- **Search** (`/hledat`) — client-side fuzzy search across characters, glossary, Q&A, flows and
  Project X; results route to the right destination.
- **PWA** — installable, runs offline (manifest + service worker), thumb-zone bottom navigation.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), **static export** (`output: "export"`) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4 |
| Data validation | Zod (parsed at load, fail-fast) |
| Search | MiniSearch |
| Tests | Vitest + Testing Library (jsdom) |
| Tooling | pnpm, ESLint (flat config), Prettier |

No runtime backend, database, or third-party services. All content ships as typed JSON.

## Architecture

```
src/
  app/                 # routes (App Router); pages are server components, data read at build
    postavy/[id]/      # 28 statically-generated character pages
    glosar/            # glossary browser
    pruvodci/[id]/     # 4 statically-generated flow pages + Q&A + Project X
    hledat/            # search
    manifest.ts        # PWA manifest (force-static)
  components/          # bottom-nav, character list/dossier, glossary browser, term-sheet,
                       # rule-text (linkifier), faq/flow/project-x lists, sw-register
  data/                # the content package (see below) — single source of truth
    schema.ts          # TypeScript interfaces (the readable contract)
    schemas.ts         # Zod schemas (runtime validation, .strict())
    index.ts           # parses + exposes the typed, validated collections
    *.json             # characters, glossary, flows, faq, projectsX
    _sources/          # BGG harvest ledger (dev tooling, not bundled)
  lib/                 # categories, lookups, linkify (glossary matcher), search index
public/
  sw.js                # dependency-free runtime-caching service worker
  icon.svg             # app icon (placeholder; branded PNGs are v0.2)
docs/blueprint/        # task packages, reports, roadmap (development workflow, below)
```

### Data model (the heart of the project)

Five validated collections, all keyed by stable `id` and richly cross-linked:

| Collection | Count | Notes |
| --- | --- | --- |
| `characters` | 28 | abilities (6 official color categories), reveal abilities, agendas, edge cases, tips |
| `glossary` | 109 | concepts, statuses, items, hazards, ship systems, sections, actions, shared abilities |
| `flows` | 4 | procedural step-by-step guides with positional branches |
| `faq` | 31 | curated Q&A, each with a `source` (provenance) |
| `projectsX` | 8 | Project X experiment cards |

`src/data/index.ts` parses every JSON with Zod at module load — a malformed record fails fast.
Integrity is enforced by tests: unique ids, valid enums, and **every cross-reference resolves**
(`relatedCharacterIds`, `seeAlso`, search/linkify targets). See `src/data/README.md` for provenance
and the authoritative-category methodology.

### Inline cross-linking

`src/lib/linkify.ts` precomputes a Unicode-aware (`\p{L}` boundaries), longest-first matcher over
every glossary `nameCs` and its `aliases`. `RuleText` splits free text against it and renders matches
as buttons that open the shared term bottom-sheet (`TermSheetProvider` / `useTermSheet`). Matching is
exact (nominative); inflected forms are intentionally out of scope for now.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000  (/ redirects to /postavy)
```

```bash
pnpm test       # Vitest (37 tests): data integrity, components, search, linkify, PWA
pnpm lint       # ESLint, zero warnings
pnpm build      # static export to ./out  (manifest.webmanifest, sw.js, all static pages)
```

Requirements: Node 20+ and pnpm (Node 24 / pnpm 10 used in development).

## Testing philosophy

Every feature lands test-first (red → green). Tests cover data integrity (counts, enums, resolvable
links), component behavior (filters, dossier, term sheet, cross-link opening, search routing), and
the search/linkify libraries. UI is verified both in unit tests and by asserting the rendered static
export.

## Offline / PWA

The app is a fully static export. `public/sw.js` is a small hand-written service worker
(cache-first with background update; resilient precache via `allSettled`) — deliberately
dependency-free and friction-free with static export. Once loaded online, the shell, data and
prefetched routes are cached for offline use at the table. Build-time precaching (Serwist) and
branded PNG icons are tracked for v0.2.

## Deployment

Live at **https://stationfall.sinimus.com** (Coolify on Hetzner, behind Cloudflare).

Two GitHub Actions workflows run on push to `main`: `ci.yml` (lint + test + build) validates the
code, and `deploy.yml` builds a Docker image (multi-stage: Node static export → nginx serving
`./out`), pushes it to `ghcr.io/sinimus/stationfall-companion-app`, then triggers a Coolify
redeploy via its API. nginx serves the static export with clean-URL routing
(`try_files $uri $uri.html`), long-cache for hashed `_next/static` assets, and no-cache for the
service worker. See `Dockerfile`, `nginx.conf`, and `.github/workflows/deploy.yml`.

## Development workflow

Built with a two-role **Beast Protocol**: an **Architect** (designs, decomposes into TDD task
packages, reviews, commits) and a **Constructor** (implements one task at a time, never commits).
Task packages and per-task reports live in `docs/blueprint/`; the v0.2 backlog is in
`docs/blueprint/roadmap-v0.2.md`.

## Roadmap (v0.2)

UI/UX polish (visual design, game iconography), a section-actions reference, linkified glossary
definitions, BGG-forum Q&A expansion (runbook ready), full searchable rulebook, live game-state
tracking, and an English/bilingual mode. See `docs/blueprint/roadmap-v0.2.md`.

## Content, provenance & disclaimer

Rules content is transcribed faithfully from the **official Czech materials** (Fox in the Box) and
enriched with the BGG rules forum’s *Massive FAQ* and designer clarifications; each Q&A carries a
`source`. Every claim is cross-checked against the reference manual (clause numbers in `ruleRefs`).

This is an **unofficial, fan-made companion**, not affiliated with or endorsed by the publisher.
*Stationfall* is designed by Matt Eklund; rules and game content are © Ion Game Design / Fox in the
Box. The app reproduces rules text only to serve owners of the game.
