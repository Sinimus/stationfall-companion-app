import { glossary } from "@/data";
import { GlossaryBrowser } from "@/components/glossary-browser";

export default function GlosarPage() {
  return (
    <main className="p-4">
      <h1 className="sr-only">Glosář</h1>
      <GlossaryBrowser terms={glossary} />
    </main>
  );
}
