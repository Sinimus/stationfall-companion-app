import { describe, it, expect } from "vitest";
import { search } from "@/lib/search";

describe("search", () => {
  it("returns nothing for an empty query", () => {
    expect(search("")).toEqual([]);
  });
  it("finds a character by ability keyword", () => {
    expect(search("EMP").some((r) => r.type === "character" && r.id === "agentka")).toBe(true);
  });
  it("finds a glossary term", () => {
    expect(search("antihmota").some((r) => r.type === "glossary" && r.id === "antihmota")).toBe(true);
  });
  it("finds a Q&A entry", () => {
    expect(search("kamery").some((r) => r.type === "faq")).toBe(true);
  });
  it("finds a Project X card", () => {
    expect(search("hejno").some((r) => r.type === "projectx")).toBe(true);
  });
  it("finds weapons via the synonym 'zbraň'", () => {
    const ids = search("zbraň").map((r) => r.id);
    expect(ids).toContain("hasak");
    expect(ids).toContain("pistole");
  });

  it("finds a term via its alias", () => {
    expect(search("HP").some((r) => r.type === "glossary" && r.id === "hracova-postava")).toBe(true);
  });
  it("finds a section by its action (reverse lookup)", () => {
    expect(search("dekontaminace").some((r) => r.type === "section" && r.id === "nadrze")).toBe(true);
  });
});
