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
