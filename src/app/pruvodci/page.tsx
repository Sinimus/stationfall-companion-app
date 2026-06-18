import Link from "next/link";
import { flows, faq } from "@/data";
import { FaqList } from "@/components/faq-list";

export default function PruvodciPage() {
  return (
    <main className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Průvodci</h1>
      <section aria-label="Postupy">
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Postupy</h2>
        <ul className="space-y-2">
          {flows.map((f) => (
            <li key={f.id}>
              <Link
                href={`/pruvodci/${f.id}`}
                className="block rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
              >
                <span className="font-medium">{f.title}</span>
                {f.intro ? <span className="mt-1 block text-sm text-zinc-500">{f.intro}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Otázky a kauzality">
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Otázky &amp; kauzality</h2>
        <FaqList faq={faq} />
      </section>
    </main>
  );
}
