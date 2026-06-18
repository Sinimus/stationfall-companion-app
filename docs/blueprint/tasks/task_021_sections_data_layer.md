# TASK 021: Sections data layer (schema + validation + integrity)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Wire the new `src/data/sections.json` (41 station sections, authored by the Architect) into the typed,
Zod-validated data layer with integrity tests — mirroring the existing collections.

## 2. Files

- Modify: `src/data/schema.ts` (add `Section` interface + zone/gravity unions; add to `StationfallData`)
- Modify: `src/data/schemas.ts` (add `sectionSchema`)
- Modify: `src/data/index.ts` (parse + export `sections` + `sectionIds`; re-export `Section`)
- Modify: `src/data/__tests__/data.smoke.test.ts` (sections count 41)
- Modify: `src/data/__tests__/data.integrity.test.ts` (section invariants)

> `src/data/sections.json` already exists and is authored — DO NOT edit it.

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests**

  Append to `src/data/__tests__/data.smoke.test.ts` (add the import + assertion):
  ```ts
  import sections from "@/data/sections.json";
  // ...inside the counts test:
  expect(sections).toHaveLength(41);
  ```

  Append to `src/data/__tests__/data.integrity.test.ts` (import `sections`, `sectionIds`, `glossaryIds`
  from `@/data` and add):
  ```ts
  it("sections: unique ids and 41 entries", () => {
    expect(sections).toHaveLength(41);
    expect(uniq(sections.map((s) => s.id))).toEqual([]);
  });

  it("every section action resolves to a glossary id", () => {
    const bad: string[] = [];
    for (const s of sections) for (const a of s.actions) if (!glossaryIds.has(a)) bad.push(`${s.id} -> ${a}`);
    expect(bad).toEqual([]);
  });
  ```
  (Reuse the existing `uniq` helper; import `sections`/`sectionIds` alongside the current imports.)

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `sections` / `sectionIds` are not exported from `@/data`.

- [ ] **Add to `src/data/schema.ts`** (before `StationfallData`):
  ```ts
  export type SectionZone =
    | "horni-prstenec"
    | "dolni-prstenec"
    | "centralni-osa"
    | "unikovy-modul"
    | "specialni";

  export type SectionGravity = "gravitace" | "nulova";

  export interface Section {
    id: string;
    nameCs: string;
    zone: SectionZone;
    gravity: SectionGravity;
    /** Nepřítomné nebo true = osvětlená; false = temná sekce (bez kamer). */
    lit?: boolean;
    powered?: boolean;
    consolePanel?: boolean;
    escapePod?: boolean;
    /** Akce dostupné v sekci — id glosářových pojmů (kind="akce"/"system"). */
    actions: string[];
    notes?: string;
  }
  ```
  And add `sections: Section[];` to the `StationfallData` interface.

- [ ] **Add to `src/data/schemas.ts`**:
  ```ts
  export const sectionZone = z.enum([
    "horni-prstenec",
    "dolni-prstenec",
    "centralni-osa",
    "unikovy-modul",
    "specialni",
  ]);

  export const sectionGravity = z.enum(["gravitace", "nulova"]);

  export const sectionSchema = z
    .object({
      id: z.string().min(1),
      nameCs: z.string().min(1),
      zone: sectionZone,
      gravity: sectionGravity,
      lit: z.boolean().optional(),
      powered: z.boolean().optional(),
      consolePanel: z.boolean().optional(),
      escapePod: z.boolean().optional(),
      actions: z.array(z.string()),
      notes: z.string().optional(),
    })
    .strict();

  export type Section = z.infer<typeof sectionSchema>;
  ```

- [ ] **Add to `src/data/index.ts`**:
  ```ts
  import sectionsJson from "./sections.json";
  import { sectionSchema } from "./schemas";
  // ...
  export const sections = z.array(sectionSchema).parse(sectionsJson);
  export const sectionIds = new Set(sections.map((s) => s.id));
  // add Section to the re-exported types from "./schemas"
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — sections count 41, unique ids, every action resolves to a glossary id; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Use Zod `.parse` (fail-fast).
- Do NOT edit `src/data/sections.json` or any other data file. If the schema rejects the data, the
  schema is wrong — fix the schema and report.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (sections in smoke + integrity; actions resolve; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. `sections` + `sectionIds` exported from `@/data`, Zod-validated at load.
4. Report written to `docs/blueprint/reports/report_021.md`.
