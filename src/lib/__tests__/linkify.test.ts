import { describe, it, expect } from "vitest";
import { splitGlossaryText } from "@/lib/linkify";

describe("splitGlossaryText", () => {
  it("links an exact glossary term", () => {
    const parts = splitGlossaryText("Antihmota exploduje.");
    const linked = parts.find((p) => p.id !== undefined);
    expect(linked?.text).toBe("Antihmota");
    expect(linked?.id).toBe("antihmota");
  });

  it("does not match inside a longer word", () => {
    // "data" is a glossary term; "database" must not be linked
    const parts = splitGlossaryText("Moje database je velká.");
    expect(parts.every((p) => p.id === undefined)).toBe(true);
  });

  it("returns the original text intact when concatenated", () => {
    const src = "Rušičky ovlivňují kopírování dat.";
    expect(splitGlossaryText(src).map((p) => p.text).join("")).toBe(src);
  });

  it("links an abbreviation via alias (HP)", () => {
    const parts = splitGlossaryText("Moje HP je v bezpečí.");
    const linked = parts.find((p) => p.id !== undefined);
    expect(linked?.text).toBe("HP");
    expect(linked?.id).toBe("hracova-postava");
  });

  it("links the BP abbreviation", () => {
    const parts = splitGlossaryText("Agentka je vaše BP.");
    expect(parts.some((p) => p.id === "bonusova-postava" && p.text === "BP")).toBe(true);
  });
});
