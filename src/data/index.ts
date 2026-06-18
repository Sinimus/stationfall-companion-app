import charactersJson from "./characters.json";
import glossaryJson from "./glossary.json";
import flowsJson from "./flows.json";
import projectsXJson from "./projectsX.json";
import faqJson from "./faq.json";
import sectionsJson from "./sections.json";
import {
  characterSchema,
  glossaryTermSchema,
  causalFlowSchema,
  projectXSchema,
  faqEntrySchema,
  sectionSchema,
} from "./schemas";
import { z } from "zod";

export const characters = z.array(characterSchema).parse(charactersJson);
export const glossary = z.array(glossaryTermSchema).parse(glossaryJson);
export const flows = z.array(causalFlowSchema).parse(flowsJson);
export const projectsX = z.array(projectXSchema).parse(projectsXJson);
export const faq = z.array(faqEntrySchema).parse(faqJson);
export const sections = z.array(sectionSchema).parse(sectionsJson);

export const characterIds = new Set(characters.map((c) => c.id));
export const glossaryIds = new Set(glossary.map((g) => g.id));
export const flowIds = new Set(flows.map((f) => f.id));
export const sectionIds = new Set(sections.map((s) => s.id));

export type {
  Character,
  GlossaryTerm,
  CausalFlow,
  ProjectX,
  FaqEntry,
  Section,
} from "./schemas";
