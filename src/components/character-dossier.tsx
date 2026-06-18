import type { ReactNode } from "react";
import type { Character } from "@/data";
import { CATEGORY_BG_CLASS, CATEGORY_LABEL, TYPE_LABEL } from "@/lib/categories";
import { RuleText } from "@/components/rule-text";
import { ProjectXWarning } from "@/components/project-x-warning";
import { FaqAccordion } from "@/components/faq-accordion";

type Ability = Character["abilities"][number];

function AbilityRow({ ability }: { ability: Ability }) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[ability.category]}`}
        >
          {CATEGORY_LABEL[ability.category]}
        </span>
        <span className="font-medium">{ability.name}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300"><RuleText>{ability.text}</RuleText></p>
    </div>
  );
}

function Section({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="border-b border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer py-3 font-semibold">{title}</summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

export function CharacterDossier({ character: c }: { character: Character }) {
  return (
    <article className="p-4">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">{c.nameCs}</h1>
        <p className="text-sm text-zinc-500">
          {TYPE_LABEL[c.type]} · Limit vlivu {c.influenceLimit} · {c.address}
        </p>
      </header>

      <ProjectXWarning targetId={c.id} />

      <FaqAccordion targetId={c.id} />

      <Section title="Schopnosti" open>
        {c.abilities.map((a) => (
          <AbilityRow key={a.name} ability={a} />
        ))}
      </Section>

      {c.revealAbilities.length > 0 && (
        <Section title="Po odhalení">
          {c.revealAbilities.map((a) => (
            <AbilityRow key={a.name} ability={a} />
          ))}
        </Section>
      )}

      <Section title="Úkoly">
        {c.agendaTitle ? <p className="mb-2 font-medium">{c.agendaTitle}</p> : null}
        <ul className="space-y-1">
          {c.agendas.map((ag, i) => (
            <li key={i} className={ag.isPlus ? "ml-4" : ""}>
              <span className="font-semibold">
                {ag.isPlus ? "+" : "•"} {ag.points} b
              </span>{" "}
              — <RuleText>{ag.text}</RuleText>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Bonusové body">
        <p className="text-sm"><RuleText>{c.bonusPoints}</RuleText></p>
      </Section>

      {c.edgeCases.length > 0 && (
        <Section title="Zvláštnosti">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {c.edgeCases.map((e, i) => (
              <li key={i}><RuleText>{e}</RuleText></li>
            ))}
          </ul>
        </Section>
      )}

      {c.tips.length > 0 && (
        <Section title="Tipy">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {c.tips.map((t, i) => (
              <li key={i}><RuleText>{t}</RuleText></li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Příprava hry">
        <p className="text-sm"><RuleText>{c.setup}</RuleText></p>
      </Section>
    </article>
  );
}
