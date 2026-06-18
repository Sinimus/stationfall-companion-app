import type { ProjectX } from "@/data";
import { RuleText } from "@/components/rule-text";
import { ProjectXModifies } from "@/components/project-x-modifies";

export function ProjectXList({ projects }: { projects: ProjectX[] }) {
  return (
    <ul className="space-y-2">
      {projects.map((p) => (
        <li key={p.id}>
          <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <summary className="cursor-pointer font-medium">{p.nameCs}</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p>
                <RuleText>{p.text}</RuleText>
              </p>
              {p.trigger ? (
                <p className="text-xs text-zinc-500">
                  Spuštění: <RuleText>{p.trigger}</RuleText>
                </p>
              ) : null}
              <ProjectXModifies project={p} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
