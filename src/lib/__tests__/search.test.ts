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
});
