import { faq, type FaqEntry } from "@/data";

const index = new Map<string, FaqEntry[]>();
for (const entry of faq) {
  for (const id of entry.seeAlso ?? []) {
    const list = index.get(id) ?? [];
    list.push(entry);
    index.set(id, list);
  }
}

export function faqFor(targetId: string): FaqEntry[] {
  return index.get(targetId) ?? [];
}
