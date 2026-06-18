import { describe, it, expect } from "vitest";
import { faqFor } from "@/lib/faq";

describe("faqFor", () => {
  it("returns Q&A whose seeAlso references the target", () => {
    expect(faqFor("nanogel").some((e) => e.id === "revive-vyzaduje-kolokaci")).toBe(true);
  });
  it("returns empty for a target with no related Q&A", () => {
    expect(faqFor("nonexistent-xyz")).toEqual([]);
  });
});
