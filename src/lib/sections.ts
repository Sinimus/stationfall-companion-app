import { sections, type Section } from "@/data";

export const sectionById = new Map<string, Section>(sections.map((s) => [s.id, s]));

export type SectionZone = Section["zone"];

export const ZONE_ORDER = [
  "horni-prstenec",
  "dolni-prstenec",
  "centralni-osa",
  "unikovy-modul",
  "specialni",
] as const satisfies readonly SectionZone[];

export const ZONE_LABEL: Record<SectionZone, string> = {
  "horni-prstenec": "Horní prstenec",
  "dolni-prstenec": "Dolní prstenec",
  "centralni-osa": "Centrální osa",
  "unikovy-modul": "Únikové moduly",
  specialni: "Speciální sekce",
};

export const GRAVITY_LABEL: Record<Section["gravity"], string> = {
  gravitace: "Gravitace",
  nulova: "Nulová gravitace",
};
