import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("exposes installable fields", () => {
    const m = manifest();
    expect(m.name).toBe("Stationfall Companion");
    expect(m.start_url).toBe("/postavy");
    expect(m.display).toBe("standalone");
    expect(m.icons && m.icons.length).toBeGreaterThan(0);
  });
});
