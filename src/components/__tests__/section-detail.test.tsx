import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { sections } from "@/data";
import { TermSheetProvider } from "@/components/term-sheet";
import { SectionDetail } from "@/components/section-detail";

function fixture(id: string) {
  const s = sections.find((x) => x.id === id);
  if (!s) throw new Error(`section ${id} missing`);
  return s;
}

describe("SectionDetail", () => {
  it("renders header and actions for the Security Station", () => {
    render(
      <TermSheetProvider>
        <SectionDetail section={fixture("bezpecnostni-stanice")} />
      </TermSheetProvider>,
    );
    expect(screen.getByRole("heading", { name: "Bezpečnostní stanice" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Výroba" })).toBeInTheDocument();
  });
});
