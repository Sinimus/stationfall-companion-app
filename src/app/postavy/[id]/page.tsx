import { notFound } from "next/navigation";
import { characters } from "@/data";
import { CharacterDossier } from "@/components/character-dossier";

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = characters.find((c) => c.id === id);
  if (!character) notFound();
  return (
    <main>
      <CharacterDossier character={character} />
    </main>
  );
}
