"use client";

import { createContext, useContext } from "react";

export type TermSheetCtx = {
  openTerm: (id: string) => void;
  openProject: (id: string) => void;
  close: () => void;
};

export const TermSheetContext = createContext<TermSheetCtx | null>(null);

export function useTermSheet(): TermSheetCtx {
  const ctx = useContext(TermSheetContext);
  if (ctx === null) throw new Error("useTermSheet must be used within TermSheetProvider");
  return ctx;
}
