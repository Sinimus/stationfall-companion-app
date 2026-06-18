"use client";

import { useState } from "react";
import Link from "next/link";
import type { Character } from "@/data";
import {
  ABILITY_CATEGORIES,
  CATEGORY_LABEL,
  CATEGORY_BG_CLASS,
  CHARACTER_TYPES,
  TYPE_LABEL,
  type AbilityCategory,
  type CharacterType,
} from "@/lib/categories";

function hasCategory(c: Character, cat: AbilityCategory): boolean {
  return [...c.abilities, ...c.revealAbilities].some((a) => a.category === cat);
}

export function CharacterList({ characters }: { characters: Character[] }) {
  const [type, setType] = useState<CharacterType | null>(null);
  const [category, setCategory] = useState<AbilityCategory | null>(null);

  const visible = characters.filter((c) => {
    if (type !== null && c.type !== type) return false;
    if (category !== null && !hasCategory(c, category)) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" aria-label="Filtr podle typu">
        {CHARACTER_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(type === t ? null : t)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filtr podle kategorie schopnosti">
        {ABILITY_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? null : c)}
            className={`rounded-full px-3 py-1 text-sm text-white opacity-60 aria-pressed:opacity-100 ${CATEGORY_BG_CLASS[c]}`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((c) => (
          <li key={c.id}>
            <Link
              href={`/postavy/${c.id}`}
              className="flex flex-col rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
            >
              <span className="font-medium">{c.nameCs}</span>
              <span className="text-xs text-zinc-500">{TYPE_LABEL[c.type]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
