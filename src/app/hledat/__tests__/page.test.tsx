import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TermSheetProvider } from "@/components/term-sheet";
import HledatPage from "@/app/hledat/page";

describe("HledatPage", () => {
  it("shows matching results as the user types", async () => {
    const user = userEvent.setup();
    render(
      <TermSheetProvider>
        <HledatPage />
      </TermSheetProvider>,
    );
    await user.type(screen.getByRole("searchbox"), "Agentka");
    expect(screen.getByRole("link", { name: /Agentka/ })).toBeInTheDocument();
  });
});
