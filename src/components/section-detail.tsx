import type { Section } from "@/data";
import { ZONE_LABEL, GRAVITY_LABEL } from "@/lib/sections";
import { RuleText } from "@/components/rule-text";
import { SectionActions } from "@/components/section-actions";
import { FaqAccordion } from "@/components/faq-accordion";

export function SectionDetail({ section: s }: { section: Section }) {
  return (
    <article className="space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold">{s.nameCs}</h1>
        <p className="text-sm text-zinc-500">
          {ZONE_LABEL[s.zone]} · {GRAVITY_LABEL[s.gravity]}
          {s.lit === false ? " · temná (bez kamer)" : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {s.powered ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">Napájecí sekce</span>
          ) : null}
          {s.consolePanel ? (
            <span className="rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900/40">Ovládací panel</span>
          ) : null}
          {s.escapePod ? (
            <span className="rounded bg-green-100 px-1.5 py-0.5 dark:bg-green-900/40">Únikový modul</span>
          ) : null}
        </div>
      </header>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Co tu můžeš dělat</h2>
        <SectionActions actionIds={s.actions} />
      </section>

      {s.notes ? (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Poznámky</h2>
          <p className="text-sm">
            <RuleText>{s.notes}</RuleText>
          </p>
        </section>
      ) : null}

      <FaqAccordion targetId={s.id} />
    </article>
  );
}
