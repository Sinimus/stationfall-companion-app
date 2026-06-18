import { describe, it, expect } from "vitest";
import { charactersStartingWith } from "@/lib/start-items";

describe("charactersStartingWith", () => {
  it("returns every character that starts possessing the item", () => {
    const ids = charactersStartingWith("pistole").map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["piratka", "plukovnik", "strazce"]));
    expect(ids).toHaveLength(3);
  });
  it("returns empty for an item nobody starts with", () => {
    expect(charactersStartingWith("antihmota")).toEqual([]);
  });
});
