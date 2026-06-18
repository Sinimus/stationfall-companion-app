import { describe, it, expect } from "vitest";
import { projectsModifying } from "@/lib/project-x";

describe("projectsModifying", () => {
  it("returns the Projects X that modify a target", () => {
    expect(projectsModifying("podezrely").some((m) => m.projectX.id === "bojove-hejno")).toBe(true);
    expect(projectsModifying("botanik").some((m) => m.projectX.id === "masozravy-bioexperiment")).toBe(true);
  });
  it("returns empty for an unmodified target", () => {
    expect(projectsModifying("nonexistent-xyz")).toEqual([]);
  });
});
