# TASK 002: Typed, Zod-validated data layer + integrity tests

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Expose the bundled data as strongly-typed, runtime-validated collections (Zod) via a single
loader, and add an integrity test suite porting the extraction-time validation (unique ids,
valid enums, resolvable cross-links).

## 2. Files

- Create: `src/data/schemas.ts` — Zod schemas mirroring `src/data/schema.ts`.
- Create: `src/data/index.ts` — parses each JSON at load, exports validated typed arrays + id maps.
- Create: `src/data/__tests__/data.integrity.test.ts` — invariant tests.
- Add dependency: `zod`.

> `src/data/schema.ts` (hand-written interfaces) stays as the human-readable contract;
> `schemas.ts` is the runtime enforcement and must stay in sync with it.

## 3. Implementation Steps (TDD)

- [ ] **Add Zod**
  Run: `pnpm add zod`

- [ ] **Write failing test** — `src/data/__tests__/data.integrity.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  characters,
  glossary,
  flows,
  projectsX,
  faq,
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
    expect(glossary).toHaveLength(109);
    expect(flows).toHaveLength(4);
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
});
```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/data` (index) does not exist yet.

- [ ] **Implement `src/data/schemas.ts`** (complete, no placeholders):

```ts
import { z } from "zod";

export const abilityCategory = z.enum([
  "ovladaci-panel",
  "konspiracni",
  "utocne",
  "obranne",
  "pohybove",
  "doplnkove",
]);

export const characterType = z.enum(["clovek", "robot", "data", "predmet"]);

export const glossaryKind = z.enum([
  "schopnost",
  "predmet",
  "data",
  "stav",
  "nebezpeci",
  "system",
  "sekce",
  "akce",
  "pojem",
]);

const ability = z
  .object({
    name: z.string(),
    category: abilityCategory,
    text: z.string(),
    isReveal: z.boolean(),
  })
  .strict();

const agenda = z
  .object({ text: z.string(), points: z.number(), isPlus: z.boolean() })
  .strict();

export const characterSchema = z
  .object({
    id: z.string().min(1),
    nameCs: z.string().min(1),
    type: characterType,
    influenceLimit: z.number().int(),
    address: z.string(),
    setup: z.string(),
    startSection: z.string().optional(),
    abilities: z.array(ability),
    revealAbilities: z.array(ability),
    agendaTitle: z.string().optional(),
    agendas: z.array(agenda),
    bonusPoints: z.string(),
    edgeCases: z.array(z.string()),
    tips: z.array(z.string()),
  })
  .strict();

export const glossaryTermSchema = z
  .object({
    id: z.string().min(1),
    nameCs: z.string().min(1),
    kind: glossaryKind,
    category: abilityCategory.optional(),
    text: z.string(),
    relatedCharacterIds: z.array(z.string()).optional(),
    ruleRefs: z.array(z.string()).optional(),
    seeAlso: z.array(z.string()).optional(),
  })
  .strict();

const flowBranch = z.object({ label: z.string(), body: z.string() }).strict();

const flowStep = z
  .object({
    title: z.string(),
    body: z.string(),
    branches: z.array(flowBranch).optional(),
    ruleRefs: z.array(z.string()).optional(),
  })
  .strict();

export const causalFlowSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    intro: z.string().optional(),
    steps: z.array(flowStep),
  })
  .strict();

export const projectXSchema = z
  .object({
    id: z.string().min(1),
    nameCs: z.string().min(1),
    text: z.string(),
    trigger: z.string().optional(),
  })
  .strict();

export const faqEntrySchema = z
  .object({
    id: z.string().min(1),
    question: z.string().min(1),
    answer: z.string().min(1),
    tags: z.array(z.string()).optional(),
    ruleRefs: z.array(z.string()).optional(),
    seeAlso: z.array(z.string()).optional(),
    source: z.string().optional(),
  })
  .strict();

export type Character = z.infer<typeof characterSchema>;
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;
export type CausalFlow = z.infer<typeof causalFlowSchema>;
export type ProjectX = z.infer<typeof projectXSchema>;
export type FaqEntry = z.infer<typeof faqEntrySchema>;
```

- [ ] **Implement `src/data/index.ts`** (complete, no placeholders):

```ts
import charactersJson from "./characters.json";
import glossaryJson from "./glossary.json";
import flowsJson from "./flows.json";
import projectsXJson from "./projectsX.json";
import faqJson from "./faq.json";
import {
  characterSchema,
  glossaryTermSchema,
  causalFlowSchema,
  projectXSchema,
  faqEntrySchema,
} from "./schemas";
import { z } from "zod";

export const characters = z.array(characterSchema).parse(charactersJson);
export const glossary = z.array(glossaryTermSchema).parse(glossaryJson);
export const flows = z.array(causalFlowSchema).parse(flowsJson);
export const projectsX = z.array(projectXSchema).parse(projectsXJson);
export const faq = z.array(faqEntrySchema).parse(faqJson);

export const characterIds = new Set(characters.map((c) => c.id));
export const glossaryIds = new Set(glossary.map((g) => g.id));
export const flowIds = new Set(flows.map((f) => f.id));

export type {
  Character,
  GlossaryTerm,
  CausalFlow,
  ProjectX,
  FaqEntry,
} from "./schemas";
```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — smoke test + all integrity tests green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; static `out/` still builds.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Use Zod `.parse` (throws on invalid) — do not soften to `.safeParse` + ignore.
- Do not modify the JSON data files or `schema.ts`. If a Zod schema rejects real data, the schema is
  wrong — fix the schema to match the data, and report it.
- Keep the existing `data.smoke.test.ts` as-is (both test files must pass).

## 5. Acceptance Criteria

1. `pnpm test` passes (smoke + integrity; counts 28/109/4/8/31, unique ids, categories, cross-links).
2. `pnpm lint` passes with zero warnings; `pnpm build` still exports static `out/`.
3. `src/data/index.ts` is the single typed entry point (Zod-validated at load).
4. Report written to `docs/blueprint/reports/report_002.md`.
