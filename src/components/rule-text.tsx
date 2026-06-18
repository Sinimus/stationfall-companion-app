"use client";

import { Fragment } from "react";
import { useTermSheet } from "@/components/term-sheet-context";
import { splitGlossaryText } from "@/lib/linkify";

export function RuleText({ children }: { children: string }) {
  const { openTerm } = useTermSheet();
  const parts = splitGlossaryText(children);
  return (
    <>
      {parts.map((part, i) => {
        const id = part.id;
        if (id !== undefined) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => openTerm(id)}
              className="underline decoration-dotted underline-offset-2"
            >
              {part.text}
            </button>
          );
        }
        return <Fragment key={i}>{part.text}</Fragment>;
      })}
    </>
  );
}
