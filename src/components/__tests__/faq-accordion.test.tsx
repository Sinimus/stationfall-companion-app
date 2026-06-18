import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TermSheetProvider } from "@/components/term-sheet";
import { FaqAccordion } from "@/components/faq-accordion";

describe("FaqAccordion", () => {
  it("lists related Q&A with a count", () => {
    render(
      <TermSheetProvider>
        <FaqAccordion targetId="nanogel" />
      </TermSheetProvider>,
    );
    expect(screen.getByText(/Specifické interakce a výjimky/)).toBeInTheDocument();
    expect(screen.getByText("Vyžaduje akce Oživení kolokaci (stejnou sekci)?")).toBeInTheDocument();
  });
  it("renders nothing when there is no related Q&A", () => {
    render(
      <TermSheetProvider>
        <FaqAccordion targetId="nonexistent-xyz" />
      </TermSheetProvider>,
    );
    expect(screen.queryByText(/Specifické interakce a výjimky/)).not.toBeInTheDocument();
  });
});
