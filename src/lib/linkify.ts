import { glossary, characters, projectsX, sections } from "@/data";

export type LinkRef = { kind: "glossary" | "character" | "projectx" | "section"; id: string };
export type TextPart = { text: string; ref?: LinkRef };

type Entry = { ref: LinkRef; name: string };

// Priority order (first wins on a shared name): glossary > character > projectx > section.
const sources: Entry[] = [
  ...glossary.flatMap((g) =>
    [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ ref: { kind: "glossary" as const, id: g.id }, name })),
  ),
  ...characters.map((c) => ({ ref: { kind: "character" as const, id: c.id }, name: c.nameCs })),
  ...projectsX.map((p) => ({ ref: { kind: "projectx" as const, id: p.id }, name: p.nameCs })),
  ...sections.map((s) => ({ ref: { kind: "section" as const, id: s.id }, name: s.nameCs })),
];

const refByLowerName = new Map<string, LinkRef>();
for (const e of sources) {
  const key = e.name.toLowerCase();
  if (!refByLowerName.has(key)) refByLowerName.set(key, e.ref);
}

const uniqueNames = [...new Set(sources.map((e) => e.name))].sort((a, b) => b.length - a.length);
const escaped = uniqueNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const pattern = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");

export function splitText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const idx = match.index;
    const matched = match[0];
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    const ref = refByLowerName.get(matched.toLowerCase());
    parts.push(ref !== undefined ? { text: matched, ref } : { text: matched });
    last = idx + matched.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
