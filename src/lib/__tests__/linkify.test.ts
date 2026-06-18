import { describe, it, expect } from "vitest";
import { splitText } from "@/lib/linkify";

describe("splitText", () => {
  it("links an exact glossary term", () => {
    const linked = splitText("Antihmota exploduje.").find((p) => p.ref?.kind === "glossary");
    expect(linked?.text).toBe("Antihmota");
    expect(linked?.ref?.id).toBe("antihmota");
  });

  it("links a character name to the character kind", () => {
    const parts = splitText("Status Psance mají Pirátka a Kyborg.");
    expect(parts.some((p) => p.ref?.kind === "character" && p.ref.id === "piratka")).toBe(true);
    expect(parts.some((p) => p.ref?.kind === "character" && p.ref.id === "kyborg")).toBe(true);
  });

  it("links the HP alias to its glossary term", () => {
    const linked = splitText("Moje HP je v bezpečí.").find((p) => p.ref !== undefined);
    expect(linked?.text).toBe("HP");
    expect(linked?.ref).toEqual({ kind: "glossary", id: "hracova-postava" });
  });

  it("does not match inside a longer word", () => {
    expect(splitText("Moje database je velká.").every((p) => p.ref === undefined)).toBe(true);
  });

  it("returns the original text intact when concatenated", () => {
    const src = "Rušičky ovlivňují kopírování dat.";
    expect(splitText(src).map((p) => p.text).join("")).toBe(src);
  });

  it("links a Project X name to the projectx kind", () => {
    const parts = splitText("Pozor na Entropický přízrak v sekci.");
    expect(parts.some((p) => p.ref?.kind === "projectx")).toBe(true);
  });

  it("links the NDA abbreviation to its glossary term", () => {
    // "Právník" is a character name (links first), so target the nda ref specifically.
    const linked = splitText("Právník umístí NDA všem.").find((p) => p.ref?.id === "nda");
    expect(linked?.ref).toEqual({ kind: "glossary", id: "nda" });
  });
});
