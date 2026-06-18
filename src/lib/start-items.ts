import { characters, type Character } from "@/data";

const index = new Map<string, Character[]>();
for (const c of characters) {
  for (const id of c.startItems ?? []) {
    const list = index.get(id) ?? [];
    list.push(c);
    index.set(id, list);
  }
}

/** Postavy, které začínají hru s daným předmětem (glosářové id). */
export function charactersStartingWith(itemId: string): Character[] {
  return index.get(itemId) ?? [];
}
