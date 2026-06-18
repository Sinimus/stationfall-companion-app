import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { faq } from "@/data";
import { TermSheetProvider } from "@/components/term-sheet";
import { FaqList } from "@/components/faq-list";

function renderList() {
  render(
    <TermSheetProvider>
      <FaqList faq={faq} />
    </TermSheetProvider>,
  );
}

describe("FaqList", () => {
  it("renders questions", () => {
    renderList();
    expect(screen.getByText("Jak anihilovat antihmotu?")).toBeInTheDocument();
  });

  it("filters by query (question text or tags)", async () => {
    const user = userEvent.setup();
    renderList();
    await user.type(screen.getByRole("searchbox"), "kamery");
    expect(screen.getByText("Jak zapnout/vypnout kamery?")).toBeInTheDocument();
    expect(screen.queryByText("Jak anihilovat antihmotu?")).not.toBeInTheDocument();
  });
});
