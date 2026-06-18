import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { flows } from "@/data";
import { TermSheetProvider } from "@/components/term-sheet";
import { FlowView } from "@/components/flow-view";

function fixture(id: string) {
  const f = flows.find((x) => x.id === id);
  if (!f) throw new Error(`flow ${id} missing`);
  return f;
}

describe("FlowView", () => {
  it("renders the flow title, a step and its positional branches", () => {
    render(
      <TermSheetProvider>
        <FlowView flow={fixture("detonace-antihmoty")} />
      </TermSheetProvider>,
    );
    expect(screen.getByRole("heading", { name: "Detonace antihmoty" })).toBeInTheDocument();
    expect(screen.getByText("Kdy se odjistí")).toBeInTheDocument();
    expect(screen.getByText("Okolní vesmír:")).toBeInTheDocument(); // branch label
    expect(screen.getByText("Na stanici:")).toBeInTheDocument();
  });
});
