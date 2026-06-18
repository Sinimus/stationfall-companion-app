"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { glossaryById, characterNameById, KIND_LABEL } from "@/lib/lookups";
import { characterIds } from "@/data";
import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from "@/lib/categories";

type TermSheetCtx = { openTerm: (id: string) => void; close: () => void };

const Ctx = createContext<TermSheetCtx | null>(null);

export function useTermSheet(): TermSheetCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTermSheet must be used within TermSheetProvider");
  return ctx;
}

export function TermSheetProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openTerm = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    if (openId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, close]);

  const term = openId !== null ? (glossaryById.get(openId) ?? null) : null;

  return (
    <Ctx.Provider value={{ openTerm, close }}>
      {children}
      {term !== null ? (
        <div className="fixed inset-0 z-50" role="presentation" onClick={close}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={term.nameCs}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-auto rounded-t-2xl bg-white p-4 dark:bg-zinc-950"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{term.nameCs}</h2>
                <p className="text-xs text-zinc-500">{KIND_LABEL[term.kind]}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Zavřít"
                className="rounded p-1 text-zinc-500"
              >
                ✕
              </button>
            </div>

            {term.category !== undefined ? (
              <span
                className={`mb-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[term.category]}`}
              >
                {CATEGORY_LABEL[term.category]}
              </span>
            ) : null}

            <p className="text-sm">{term.text}</p>

            {term.relatedCharacterIds && term.relatedCharacterIds.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-zinc-500">Objevuje se u</p>
                <div className="flex flex-wrap gap-2">
                  {term.relatedCharacterIds.map((cid) => (
                    <Link
                      key={cid}
                      href={`/postavy/${cid}`}
                      onClick={close}
                      className="text-sm underline"
                    >
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
                        <button
                          key={sid}
                          type="button"
                          onClick={() => openTerm(sid)}
                          className="text-sm underline"
                        >
                          {t.nameCs}
                        </button>
                      );
                    }
                    if (characterIds.has(sid)) {
                      return (
                        <Link
                          key={sid}
                          href={`/postavy/${sid}`}
                          onClick={close}
                          className="text-sm underline"
                        >
                          {characterNameById.get(sid) ?? sid}
                        </Link>
                      );
                    }
                    return (
                      <Link
                        key={sid}
                        href={`/pruvodci/${sid}`}
                        onClick={close}
                        className="text-sm underline"
                      >
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
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
