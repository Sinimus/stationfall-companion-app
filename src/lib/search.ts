import MiniSearch from "minisearch";
import { characters, glossary, faq, flows } from "@/data";

export type ResultType = "character" | "glossary" | "faq" | "flow";
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
for (const g of glossary) add("glossary", g.id, g.nameCs, g.text);
for (const f of faq) add("faq", f.id, f.question, `${f.answer} ${(f.tags ?? []).join(" ")}`);
for (const fl of flows) {
  const body = `${fl.intro ?? ""} ${fl.steps.map((s) => `${s.title} ${s.body}`).join(" ")}`;
  add("flow", fl.id, fl.title, body);
}

const index = new MiniSearch<Doc>({
  idField: "ref",
  fields: ["title", "body"],
  searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
});
index.addAll(docs);

export function search(query: string): SearchResult[] {
  if (query.trim() === "") return [];
  return index
    .search(query)
    .map((r) => meta.get(String(r.id)))
    .filter((x): x is SearchResult => x !== undefined);
}
