import { projectsX, type ProjectX } from "@/data";

export type ProjectXModifier = { projectX: ProjectX; note: string };

const index = new Map<string, ProjectXModifier[]>();
for (const px of projectsX) {
  for (const m of px.modifies ?? []) {
    const list = index.get(m.targetId) ?? [];
    list.push({ projectX: px, note: m.note });
    index.set(m.targetId, list);
  }
}

export function projectsModifying(targetId: string): ProjectXModifier[] {
  return index.get(targetId) ?? [];
}
