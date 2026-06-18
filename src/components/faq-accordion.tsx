"use client";

import { faqFor } from "@/lib/faq";
import { RuleText } from "@/components/rule-text";

export function FaqAccordion({ targetId }: { targetId: string }) {
  const entries = faqFor(targetId);
  if (entries.length === 0) return null;
  return (
    <details className="mt-3 rounded-md border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer p-2 text-sm font-medium">
        Specifické interakce a výjimky ({entries.length})
      </summary>
      <ul className="space-y-2 p-2 pt-0 text-sm">
        {entries.map((entry) => (
          <li key={entry.id}>
            <p className="font-medium">{entry.question}</p>
            <p className="text-zinc-600 dark:text-zinc-300">
              <RuleText>{entry.answer}</RuleText>
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
