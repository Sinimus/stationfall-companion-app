"use client";

import { useState } from "react";
import Link from "next/link";
import type { Section } from "@/data";
import { ZONE_ORDER, ZONE_LABEL, GRAVITY_LABEL, ZONE_ICON, GRAVITY_ICON } from "@/lib/sections";

type PropFilter = "lit" | "powered" | "consolePanel";

const PROP_FILTERS: { key: PropFilter; label: string }[] = [
  { key: "lit", label: "Temná" },
  { key: "powered", label: "Napájecí" },
  { key: "consolePanel", label: "Ovládací panel" },
];

export function SectionList({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState<ReadonlySet<PropFilter>>(new Set());

  function toggle(key: PropFilter) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function pass(s: Section): boolean {
    if (active.has("lit") && s.lit !== false) return false;
    if (active.has("powered") && s.powered !== true) return false;
    if (active.has("consolePanel") && s.consolePanel !== true) return false;
    return true;
  }

  const visible = sections.filter(pass);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Filtr sekcí">
        {PROP_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={active.has(key)}
            onClick={() => toggle(key)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
          >
            {label}
          </button>
        ))}
      </div>

      {ZONE_ORDER.map((zone) => {
        const group = visible
          .filter((s) => s.zone === zone)
          .sort((a, b) => a.nameCs.localeCompare(b.nameCs, "cs"));
        if (group.length === 0) return null;
        const ZoneIcon = ZONE_ICON[zone];
        return (
          <section key={zone} aria-label={ZONE_LABEL[zone]}>
            <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-500">
              <ZoneIcon className="size-3.5" aria-hidden />
              {ZONE_LABEL[zone]}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.map((s) => {
                const GravIcon = GRAVITY_ICON[s.gravity];
                return (
                  <li key={s.id}>
                    <Link
                      href={`/sekce/${s.id}`}
                      className="flex flex-col rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                    >
                      <span className="font-medium">{s.nameCs}</span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <GravIcon className="size-3" aria-hidden />
                        {GRAVITY_LABEL[s.gravity]}
                        {s.lit === false ? " · temná" : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
