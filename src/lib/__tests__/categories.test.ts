import { describe, it, expect } from "vitest";
import { ABILITY_CATEGORIES, CATEGORY_LABEL, CATEGORY_BG_CLASS } from "@/lib/categories";

describe("category helpers", () => {
  it("covers all six official categories", () => {
    expect(ABILITY_CATEGORIES).toHaveLength(6);
  });
  it("has a label and bg class for every category", () => {
    for (const c of ABILITY_CATEGORIES) {
      expect(CATEGORY_LABEL[c]).toBeTruthy();
      expect(CATEGORY_BG_CLASS[c]).toMatch(/^bg-cat-/);
    }
  });
});
