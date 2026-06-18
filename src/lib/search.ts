import MiniSearch from "minisearch";
import { characters, glossary, faq, flows, projectsX, sections } from "@/data";
import { glossaryById } from "@/lib/lookups";

export type ResultType = "character" | "glossary" | "faq" | "flow" | "projectx" | "section";
export type SearchResult = { type: ResultType; id: string; title: string };

type Doc = { ref: string; title: string; body: string };

const meta = new Map<string, SearchResult>();
const docs: Doc[] = [];

function add(type: ResultType, id: string, title: string, body: string): void {
  const ref = `${type}:${id}`;
  meta.set(ref, { type, id, title });
  docs.push({ ref, title, body });
}

for (const c of characters) {
  const body = [
    ...c.abilities.map((a) => `${a.name} ${a.text}`),
    ...c.revealAbilities.map((a) => `${a.name} ${a.text}`),
    ...c.edgeCases,
    ...c.tips,
    c.setup,
  ].join(" ");
  add("character", c.id, c.nameCs, body);
}
for (const g of glossary) add("glossary", g.id, g.nameCs, `${g.text} ${(g.aliases ?? []).join(" ")}`);
for (const f of faq) add("faq", f.id, f.question, `${f.answer} ${(f.tags ?? []).join(" ")}`);
for (const fl of flows) {
  const body = `${fl.intro ?? ""} ${fl.steps.map((s) => `${s.title} ${s.body}`).join(" ")}`;
  add("flow", fl.id, fl.title, body);
}
for (const p of projectsX) add("projectx", p.id, p.nameCs, `${p.text} ${p.trigger ?? ""}`);
for (const s of sections) {
  const actionNames = s.actions.map((a) => glossaryById.get(a)?.nameCs ?? a).join(" ");
  add("section", s.id, s.nameCs, `${actionNames} ${s.notes ?? ""}`);
}

const index = new MiniSearch<Doc>({
  idField: "ref",
  fields: ["title", "body"],
  searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
});
index.addAll(docs);

// Curated query-time synonyms (search-only; does NOT affect inline linkify).
const SYNONYMS: Record<string, string> = {
  zbraň: "hasák pistole",
  zbrane: "hasák pistole",
  zbraně: "hasák pistole",
  weapon: "hasák pistole",
  gun: "pistole",
  kamera: "kamery",
  přilba: "helma",
  helmet: "helma",
  bomba: "ohnivá bomba",
};

function expandQuery(query: string): string {
  const extra = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => SYNONYMS[token])
    .filter((value): value is string => value !== undefined);
  return extra.length > 0 ? `${query} ${extra.join(" ")}` : query;
}

export function search(query: string): SearchResult[] {
  if (query.trim() === "") return [];
  return index
    .search(expandQuery(query))
    .map((r) => meta.get(String(r.id)))
    .filter((x): x is SearchResult => x !== undefined);
}
