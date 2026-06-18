import { describe, it, expect } from "vitest";
import characters from "@/data/characters.json";
import glossary from "@/data/glossary.json";
import flows from "@/data/flows.json";
import projectsX from "@/data/projectsX.json";
import faq from "@/data/faq.json";

describe("data package loads", () => {
  it("has the expected record counts", () => {
    expect(characters).toHaveLength(28);
    expect(glossary).toHaveLength(110);
    expect(flows).toHaveLength(4);
    expect(projectsX).toHaveLength(8);
    expect(faq).toHaveLength(31);
  });

  it("every character has a non-empty id and nameCs", () => {
    for (const c of characters) {
      expect(c.id).toBeTruthy();
      expect(c.nameCs).toBeTruthy();
    }
  });
});
