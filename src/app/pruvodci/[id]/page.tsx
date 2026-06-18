import { notFound } from "next/navigation";
import { flows } from "@/data";
import { FlowView } from "@/components/flow-view";

export function generateStaticParams() {
  return flows.map((f) => ({ id: f.id }));
}

export default async function FlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flow = flows.find((f) => f.id === id);
  if (!flow) notFound();
  return (
    <main>
      <FlowView flow={flow} />
    </main>
  );
}
