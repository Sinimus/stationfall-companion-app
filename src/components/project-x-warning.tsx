"use client";

import { useTermSheet } from "@/components/term-sheet-context";
import { projectsModifying } from "@/lib/project-x";

export function ProjectXWarning({ targetId }: { targetId: string }) {
  const { openProject } = useTermSheet();
  const modifiers = projectsModifying(targetId);
  if (modifiers.length === 0) return null;
  return (
    <div className="mt-3 space-y-1 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm dark:border-amber-700 dark:bg-amber-950/40">
      {modifiers.map(({ projectX, note }) => (
        <p key={projectX.id}>
          ⚠ Modifikováno Projektem X:{" "}
          <button
            type="button"
            onClick={() => openProject(projectX.id)}
            className="font-medium underline"
          >
            {projectX.nameCs}
          </button>{" "}
          — {note}
        </p>
      ))}
    </div>
  );
}
