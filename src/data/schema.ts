// Stationfall (CZ: "Zkáza na orbitě") — datové schéma pro mobilní pravidlového průvodce.
// Zdroj pravdy: oficiální CZ materiály (Fox in the Box) v této složce.
// Veškerý obsahový text je CZ a citován co nejvěrněji originálu. Nehalucinovat.

/** Barevná kategorie schopnosti dle oficiálního klíče. */
export type AbilityCategory =
  | "ovladaci-panel" // oranžová
  | "konspiracni" //    fialová
  | "utocne" //         červená
  | "obranne" //        zelená
  | "pohybove" //       žlutá
  | "doplnkove"; //     růžová

/** Typ postavy (symbol na figurce/kartě). */
export type CharacterType = "clovek" | "robot" | "data" | "predmet";

/** Druh položky v glosáři. */
export type GlossaryKind =
  | "schopnost" //  pojmenovaná schopnost postav (keyword)
  | "predmet" //    fyzický předmět (helma, pistole, ...)
  | "data" //       typ dat (Tajemství X, Důkazy)
  | "stav" //       stav postavy (Vyřazený, Anihilovaný, Podezřelý, ...)
  | "nebezpeci" //  hazard (Oheň, Udušení, Okolní vesmír)
  | "system" //     systém stanice (Energie/Blackout, Evakuace, ...)
  | "sekce" //      typ/vlastnost sekce
  | "akce" //       akce (sekce / ovládacího panelu / základní)
  | "pojem"; //     obecný pojem (Konspirátor, Vlastnictví, ...)

export interface Ability {
  /** CZ název keywordu, např. "Důstojník". Prázdné pro postavy bez pojmenované schopnosti. */
  name: string;
  category: AbilityCategory;
  /** Plný CZ popis schopnosti, věrně dle Složky postavy. */
  text: string;
  /** true = "Schopnost po odhalení". */
  isReveal: boolean;
}

export interface Agenda {
  /** Podmínka pro body, věrně dle karty (CZ). */
  text: string;
  points: number;
  /** true, pokud řádek začíná "+" (závisí na splnění nejbližšího předchozího řádku bez "+"). */
  isPlus: boolean;
}

export interface Character {
  /** kebab-case bez diakritiky, např. "cerna-pasazerka". */
  id: string;
  nameCs: string;
  type: CharacterType;
  /** Limit vlivu (bílá kostka). */
  influenceLimit: number;
  /** Oslovení, např. "Ona" / "On" / "Oni" / "Ono". */
  address: string;
  /** Příprava hry (CZ text). Včetně startovní lokace a žetonů, pokud uvedeno. */
  setup: string;
  /** Startovní sekce, pokud je explicitně uvedena (jinak vynechat). */
  startSection?: string;
  /** Základní schopnosti. */
  abilities: Ability[];
  /** Schopnosti po odhalení. */
  revealAbilities: Ability[];
  /** Název sady úkolů, pokud uveden (např. "ZAMETENÍ DŮKAZŮ"). */
  agendaTitle?: string;
  agendas: Agenda[];
  /** Bonusové body (text Přítel/Nepřítel + podmínka). */
  bonusPoints: string;
  /** Zvláštnosti a okrajové případy (bullety). */
  edgeCases: string[];
  /** Tipy (bullety). */
  tips: string[];
}

export interface GlossaryTerm {
  /** kebab-case bez diakritiky. */
  id: string;
  nameCs: string;
  /** Alternativní tvary pro vyhledávání a inline linkování (např. zkratky "HP"). */
  aliases?: string[];
  kind: GlossaryKind;
  /** Jen pro kind="schopnost". */
  category?: AbilityCategory;
  text: string;
  /** Postavy, u kterých se pojem objevuje. */
  relatedCharacterIds?: string[];
  /** Odkazy na klauzule referenční příručky, např. ["8.1.1","12.8"]. */
  ruleRefs?: string[];
  /** Odkazy na jiné pojmy (jejich id). */
  seeAlso?: string[];
}

export interface FlowBranch {
  label: string;
  body: string;
}

export interface FlowStep {
  title: string;
  body: string;
  branches?: FlowBranch[];
  ruleRefs?: string[];
}

export interface CausalFlow {
  id: string;
  title: string;
  intro?: string;
  steps: FlowStep[];
}

export interface ProjectX {
  id: string;
  nameCs: string;
  text: string;
  /** Jak/kdy se spouští, pokud uvedeno. */
  trigger?: string;
  /** Pravidla/postavy, které tento Projekt X mění (pro statické cross-link varování). */
  modifies?: { targetId: string; targetKind: "glossary" | "character"; note: string }[];
}

/**
 * Kurátorovaná otázka & odpověď pro pilíř "Otázky & kauzality".
 * Odpovídá na bodové kauzální/how-to dotazy (typu "Vyžaduje Oživení kolokaci?",
 * "Jak anihilovat antihmotu?"), které procedurální flow nepokrývají.
 */
export interface FaqEntry {
  id: string;
  /** Kanonické znění otázky (CZ). */
  question: string;
  /** Stručná odpověď (CZ), věrná pravidlům. */
  answer: string;
  /** Štítky pro facety a vyhledávání (synonyma, klíčová slova, i EN termíny). */
  tags?: string[];
  ruleRefs?: string[];
  /** Odkazy na pojmy v glosáři, flow nebo postavy (jejich id). */
  seeAlso?: string[];
  /** Provenance/autorita odpovědi (např. "Ref. 7.3.3", "BGG Massive FAQ", "Dev Andy Mesa"). */
  source?: string;
}

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

export interface StationfallData {
  characters: Character[];
  glossary: GlossaryTerm[];
  flows: CausalFlow[];
  projectsX: ProjectX[];
  faq: FaqEntry[];
  sections: Section[];
}
