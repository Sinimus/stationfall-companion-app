import { glossary } from "@/data";

export type TextPart = { text: string; id?: string };

const entries = glossary
  .flatMap((g) => [g.nameCs, ...(g.aliases ?? [])].map((name) => ({ id: g.id, name })))
  .sort((a, b) => b.name.length - a.name.length);

const idByLowerName = new Map<string, string>(
  entries.map((e) => [e.name.toLowerCase(), e.id]),
);

const escaped = entries.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const pattern = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");

export function splitGlossaryText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const idx = match.index;
    const matched = match[0];
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    const id = idByLowerName.get(matched.toLowerCase());
    parts.push(id !== undefined ? { text: matched, id } : { text: matched });
    last = idx + matched.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
