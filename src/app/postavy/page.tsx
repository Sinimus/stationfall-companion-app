import { characters } from "@/data";
import { CharacterList } from "@/components/character-list";

export default function PostavyPage() {
  const sorted = [...characters].sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
  return (
    <main className="p-4">
      <h1 className="sr-only">Postavy</h1>
      <CharacterList characters={sorted} />
    </main>
  );
}
