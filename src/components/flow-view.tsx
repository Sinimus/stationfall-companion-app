import type { CausalFlow } from "@/data";
import { RuleText } from "@/components/rule-text";
import { Prose } from "@/components/prose";

export function FlowView({ flow }: { flow: CausalFlow }) {
  return (
    <article className="p-4">
      <h1 className="text-2xl font-semibold">{flow.title}</h1>
      {flow.intro ? (
        <Prose className="mt-1 text-zinc-300">
          <RuleText>{flow.intro}</RuleText>
        </Prose>
      ) : null}

      <ol className="mt-4 space-y-4">
        {flow.steps.map((step, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <h2 className="font-semibold">{step.title}</h2>
            <Prose className="mt-1">
              <RuleText>{step.body}</RuleText>
            </Prose>

            {step.branches && step.branches.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {step.branches.map((b, j) => (
                  <li key={j} className="rounded bg-zinc-50 p-2 text-sm dark:bg-zinc-900">
                    <span className="font-medium">{b.label}:</span>{" "}
                    <RuleText>{b.body}</RuleText>
                  </li>
                ))}
              </ul>
            ) : null}

            {step.ruleRefs && step.ruleRefs.length > 0 ? (
              <p className="mt-2 text-xs text-zinc-500">Pravidla: {step.ruleRefs.join(", ")}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}
