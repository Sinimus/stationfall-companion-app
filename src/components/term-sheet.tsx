"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { glossaryById, characterNameById, projectById, KIND_LABEL } from "@/lib/lookups";
import { characterIds } from "@/data";
import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from "@/lib/categories";
import { TermSheetContext } from "@/components/term-sheet-context";
import { RuleText } from "@/components/rule-text";
import { ProjectXWarning } from "@/components/project-x-warning";

export { useTermSheet } from "@/components/term-sheet-context";

type OpenRef = { kind: "glossary"; id: string } | { kind: "projectx"; id: string };

export function TermSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenRef | null>(null);
  const openTerm = useCallback((id: string) => setOpen({ kind: "glossary", id }), []);
  const openProject = useCallback((id: string) => setOpen({ kind: "projectx", id }), []);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const term = open?.kind === "glossary" ? (glossaryById.get(open.id) ?? null) : null;
  const project = open?.kind === "projectx" ? (projectById.get(open.id) ?? null) : null;
  const title = term?.nameCs ?? project?.nameCs ?? "";
  const isOpen = term !== null || project !== null;

  return (
    <TermSheetContext.Provider value={{ openTerm, openProject, close }}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-50" role="presentation" onClick={close}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-auto rounded-t-2xl bg-white p-4 dark:bg-zinc-950"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-xs text-zinc-500">
                  {term !== null ? KIND_LABEL[term.kind] : "Projekt X"}
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Zavřít" className="rounded p-1 text-zinc-500">
                ✕
              </button>
            </div>

            {term !== null ? (
              <>
                {term.category !== undefined ? (
                  <span
                    className={`mb-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[term.category]}`}
                  >
                    {CATEGORY_LABEL[term.category]}
                  </span>
                ) : null}

                <p className="text-sm">
                  <RuleText>{term.text}</RuleText>
                </p>

                {term.relatedCharacterIds && term.relatedCharacterIds.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-zinc-500">Objevuje se u</p>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedCharacterIds.map((cid) => (
                        <Link key={cid} href={`/postavy/${cid}`} onClick={close} className="text-sm underline">
                          {characterNameById.get(cid) ?? cid}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {term.seeAlso && term.seeAlso.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-zinc-500">Související</p>
                    <div className="flex flex-wrap gap-2">
                      {term.seeAlso.map((sid) => {
                        const t = glossaryById.get(sid);
                        if (t !== undefined) {
                          return (
                            <button key={sid} type="button" onClick={() => openTerm(sid)} className="text-sm underline">
                              {t.nameCs}
                            </button>
                          );
                        }
                        if (characterIds.has(sid)) {
                          return (
                            <Link key={sid} href={`/postavy/${sid}`} onClick={close} className="text-sm underline">
                              {characterNameById.get(sid) ?? sid}
                            </Link>
                          );
                        }
                        return (
                          <Link key={sid} href={`/pruvodci/${sid}`} onClick={close} className="text-sm underline">
                            {sid}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {term.ruleRefs && term.ruleRefs.length > 0 ? (
                  <p className="mt-3 text-xs text-zinc-500">Pravidla: {term.ruleRefs.join(", ")}</p>
                ) : null}

                <ProjectXWarning targetId={term.id} />
              </>
            ) : null}

            {project !== null ? (
              <div className="space-y-2 text-sm">
                <p>
                  <RuleText>{project.text}</RuleText>
                </p>
                {project.trigger ? (
                  <p className="text-xs text-zinc-500">
                    Spuštění: <RuleText>{project.trigger}</RuleText>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </TermSheetContext.Provider>
  );
}
