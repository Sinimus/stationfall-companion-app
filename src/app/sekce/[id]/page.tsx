import { notFound } from "next/navigation";
import { sections } from "@/data";
import { SectionDetail } from "@/components/section-detail";

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = sections.find((s) => s.id === id);
  if (!section) notFound();
  return (
    <main>
      <SectionDetail section={section} />
    </main>
  );
}
