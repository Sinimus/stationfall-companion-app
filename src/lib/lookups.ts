import { characters, glossary, projectsX, type GlossaryTerm, type ProjectX } from "@/data";

export const glossaryById = new Map<string, GlossaryTerm>(glossary.map((g) => [g.id, g]));
export const characterNameById = new Map<string, string>(
  characters.map((c) => [c.id, c.nameCs]),
);
export const projectById = new Map<string, ProjectX>(projectsX.map((p) => [p.id, p]));

export type GlossaryKind = GlossaryTerm["kind"];

export const KIND_ORDER = [
  "pojem",
  "stav",
  "predmet",
  "data",
  "nebezpeci",
  "system",
  "sekce",
  "akce",
  "schopnost",
] as const satisfies readonly GlossaryKind[];

export const KIND_LABEL: Record<GlossaryKind, string> = {
  pojem: "Pojmy",
  stav: "Stavy",
  predmet: "Předměty",
  data: "Data",
  nebezpeci: "Nebezpečí",
  system: "Systémy stanice",
  sekce: "Sekce",
  akce: "Akce",
  schopnost: "Schopnosti",
};
