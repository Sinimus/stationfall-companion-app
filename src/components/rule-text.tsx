"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useTermSheet } from "@/components/term-sheet-context";
import { splitText } from "@/lib/linkify";

const LINK_CLASS = "underline decoration-dotted underline-offset-2";

export function RuleText({ children }: { children: string }) {
  const { openTerm, openProject } = useTermSheet();
  return (
    <>
      {splitText(children).map((part, i) => {
        const ref = part.ref;
        if (ref === undefined) return <Fragment key={i}>{part.text}</Fragment>;
        if (ref.kind === "character") {
          return (
            <Link key={i} href={`/postavy/${ref.id}`} className={LINK_CLASS}>
              {part.text}
            </Link>
          );
        }
        if (ref.kind === "section") {
          return (
            <Link key={i} href={`/sekce/${ref.id}`} className={LINK_CLASS}>
              {part.text}
            </Link>
          );
        }
        if (ref.kind === "projectx") {
          return (
            <button key={i} type="button" onClick={() => openProject(ref.id)} className={LINK_CLASS}>
              {part.text}
            </button>
          );
        }
        return (
          <button key={i} type="button" onClick={() => openTerm(ref.id)} className={LINK_CLASS}>
            {part.text}
          </button>
        );
      })}
    </>
  );
}
