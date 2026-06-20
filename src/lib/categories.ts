import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Shield,
  Swords,
  EyeOff,
  SlidersHorizontal,
  Sparkles,
  User,
  Bot,
  Database,
  Package,
} from "lucide-react";
import type { Character } from "@/data";

export type AbilityCategory = Character["abilities"][number]["category"];

export const ABILITY_CATEGORIES = [
  "pohybove",
  "obranne",
  "utocne",
  "konspiracni",
  "ovladaci-panel",
  "doplnkove",
] as const satisfies readonly AbilityCategory[];

export const CATEGORY_LABEL: Record<AbilityCategory, string> = {
  pohybove: "Pohybové",
  obranne: "Obranné",
  utocne: "Útočné",
  konspiracni: "Konspirační",
  "ovladaci-panel": "Ovládací panel",
  doplnkove: "Doplňkové",
};

export const CATEGORY_BG_CLASS: Record<AbilityCategory, string> = {
  pohybove: "bg-cat-pohybove",
  obranne: "bg-cat-obranne",
  utocne: "bg-cat-utocne",
  konspiracni: "bg-cat-konspiracni",
  "ovladaci-panel": "bg-cat-ovladaci-panel",
  doplnkove: "bg-cat-doplnkove",
};

export type CharacterType = Character["type"];

export const CHARACTER_TYPES = [
  "clovek",
  "robot",
  "data",
  "predmet",
] as const satisfies readonly CharacterType[];

export const TYPE_LABEL: Record<CharacterType, string> = {
  clovek: "Člověk",
  robot: "Robot",
  data: "Data",
  predmet: "Předmět",
};

export const CATEGORY_ICON: Record<AbilityCategory, LucideIcon> = {
  pohybove: Footprints,
  obranne: Shield,
  utocne: Swords,
  konspiracni: EyeOff,
  "ovladaci-panel": SlidersHorizontal,
  doplnkove: Sparkles,
};

export const TYPE_ICON: Record<CharacterType, LucideIcon> = {
  clovek: User,
  robot: Bot,
  data: Database,
  predmet: Package,
};
