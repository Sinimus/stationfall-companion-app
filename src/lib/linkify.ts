import { glossary, characters } from "@/data";

export type LinkRef = { kind: "glossary" | "character"; id: string };
export type TextPart = { text: string; ref?: LinkRef };

type Entry = { ref: LinkRef; name: string };

const entries: Entry[] = [
  ...glossary.flatMap((g) =>
    [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ ref: { kind: "glossary" as const, id: g.id }, name })),
  ),
  ...characters.map((c) => ({ ref: { kind: "character" as const, id: c.id }, name: c.nameCs })),
].sort((a, b) => b.name.length - a.name.length);

const refByLowerName = new Map<string, LinkRef>(entries.map((e) => [e.name.toLowerCase(), e.ref]));
const escaped = entries.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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
