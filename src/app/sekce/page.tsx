import { sections } from "@/data";
import { SectionList } from "@/components/section-list";

export default function SekcePage() {
  return (
    <main className="p-4">
      <h1 className="sr-only">Sekce</h1>
      <SectionList sections={sections} />
    </main>
  );
}
