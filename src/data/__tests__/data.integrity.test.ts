import { describe, it, expect } from "vitest";
import {
  characters,
  glossary,
  flows,
  projectsX,
  faq,
  sections,
  characterIds,
  glossaryIds,
  flowIds,
} from "@/data";

const linkTargets = new Set<string>([...characterIds, ...glossaryIds, ...flowIds]);

function uniq(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  return dupes;
}

describe("data integrity", () => {
  it("parses all collections with expected counts", () => {
    expect(characters).toHaveLength(28);
    expect(glossary).toHaveLength(110);
    expect(flows).toHaveLength(8);
    expect(projectsX).toHaveLength(8);
    expect(faq).toHaveLength(31);
  });

  it("has unique ids within each collection", () => {
    expect(uniq(characters.map((c) => c.id))).toEqual([]);
    expect(uniq(glossary.map((g) => g.id))).toEqual([]);
    expect(uniq(flows.map((f) => f.id))).toEqual([]);
    expect(uniq(projectsX.map((p) => p.id))).toEqual([]);
    expect(uniq(faq.map((q) => q.id))).toEqual([]);
  });

  it("every glossary 'schopnost' has a category", () => {
    const missing = glossary
      .filter((g) => g.kind === "schopnost" && g.category === undefined)
      .map((g) => g.id);
    expect(missing).toEqual([]);
  });

  it("every relatedCharacterIds points to an existing character", () => {
    const bad: string[] = [];
    for (const g of glossary)
      for (const cid of g.relatedCharacterIds ?? [])
        if (!characterIds.has(cid)) bad.push(`${g.id} -> ${cid}`);
    expect(bad).toEqual([]);
  });

  it("every seeAlso (glossary + faq) resolves to a glossary/flow/character id", () => {
    const bad: string[] = [];
    for (const g of glossary)
      for (const s of g.seeAlso ?? [])
        if (!linkTargets.has(s)) bad.push(`glossary ${g.id} -> ${s}`);
    for (const q of faq)
      for (const s of q.seeAlso ?? [])
        if (!linkTargets.has(s)) bad.push(`faq ${q.id} -> ${s}`);
    expect(bad).toEqual([]);
  });

  it("sections: unique ids and 41 entries", () => {
    expect(sections).toHaveLength(41);
    expect(uniq(sections.map((s) => s.id))).toEqual([]);
  });

  it("every section action resolves to a glossary id", () => {
    const bad: string[] = [];
    for (const s of sections)
      for (const a of s.actions)
        if (!glossaryIds.has(a)) bad.push(`${s.id} -> ${a}`);
    expect(bad).toEqual([]);
  });

  it("every Project X 'modifies' target resolves", () => {
    const bad: string[] = [];
    for (const px of projectsX)
      for (const m of px.modifies ?? []) {
        const ok = m.targetKind === "glossary" ? glossaryIds.has(m.targetId) : characterIds.has(m.targetId);
        if (!ok) bad.push(`${px.id} -> ${m.targetId}`);
      }
    expect(bad).toEqual([]);
  });
});
