# Runbook: BGG FAQ harvest (post-MVP content expansion)

**Goal:** keep growing the `data/faq.json` causality layer from the BGG *Stationfall*
**Rules** forum, which captures real at-the-table edge cases — incrementally, without
manual transcription and without any AI baked into the shipped app.

## Boundary (important)

- The **app is AI-free**: it only reads the static `data/faq.json`. No runtime LLM, no backend.
- **Expansion is a dev-time maintenance task**, run occasionally by **Claude Code in a session**.
  The semantic step (parse English thread → judge authority → translate to our CZ terminology →
  structure into `FaqEntry`) needs judgement, so the "AI" is the maintenance operator, not a
  wired service and not a human re-typing. A pure no-LLM scrape would only yield an unvetted
  English dump — that would destroy the curated CZ quality, so it is explicitly rejected.

## Why BGG is special-cased

BGG is fully behind Cloudflare — the XML API and web pages both return 401/403 to
`curl`/WebFetch. The **only** working path is the **connected Chrome extension**
(`claude-in-chrome`) with the user logged into BGG. Headless scraping is not possible.

## Repeatable procedure

1. **Connect browser:** ensure the Claude Chrome extension is paired (`tabs_context_mcp`); user
   logged into BGG. If `list_connected_browsers` is empty, `switch_browser` and click *Connect*.
2. **Scan the rules forum** (`/boardgame/316624/stationfall/forums/66`, sort by *Top* / replies)
   for new or high-signal threads. Compare against `data/_sources/processed-threads.json` →
   skip `mined`, prioritise `candidates`, high recommends/replies, character-quirk and scoring threads.
3. **Read each new thread:** `navigate` + `get_page_text` (captures the OP — where aggregated FAQs
   live). For Q&A whose answer is in replies, also `read_page` to capture replies. Prefer answers
   from the **designer (Matt Eklund) / developer (Andy Mesa) / official clarifications**; treat
   unconfirmed user opinions with caution.
4. **Cross-check** every claim against the Reference Manual (`ruleRefs`). If a forum answer
   conflicts with the rulebook, the rulebook wins — flag the conflict.
5. **Author CZ `FaqEntry`** objects: `question`, `answer`, `tags` (incl. EN synonyms for search),
   `ruleRefs`, `seeAlso` (glossary/flow/character ids), `source` (provenance/authority). Use the
   established CZ terminology (Důstojník, Okolní vesmír, Rušičky, …) — keep it consistent with the
   Petr Pospíšil CZ translation.
6. **Dedupe** against existing `faq.json` ids/questions; merge rather than duplicate.
7. **Validate:** unique ids, all `seeAlso` resolve, required fields present (reuse the data-integrity test).
8. **Update the ledger** `data/_sources/processed-threads.json` (`mined` += thread, `entriesYielded`,
   `lastScan`) and **commit**.

## State

- Ledger: `data/_sources/processed-threads.json`.
- Current `faq.json`: 31 entries; primary source = "Massive FAQ" thread (3021145).
- Top un-mined candidate: **"More FAQ IMHO"** (tony0021074, 26 recommends).

## Possible future automation

If this becomes frequent, wrap steps 2–8 as a Claude Code **skill** ("harvest-bgg-faq") so a single
invocation drives the browser, proposes new `FaqEntry` objects for review, and updates the ledger.
Still operator-in-the-loop; still no AI in the shipped app.
