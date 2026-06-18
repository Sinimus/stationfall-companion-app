import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TermSheetProvider } from "@/components/term-sheet";
import { RuleText } from "@/components/rule-text";

describe("RuleText", () => {
  it("opens the glossary term when a linked keyword is tapped", async () => {
    const user = userEvent.setup();
    render(
      <TermSheetProvider>
        <RuleText>Antihmota se odjistí.</RuleText>
      </TermSheetProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    expect(screen.getByRole("dialog", { name: "Antihmota" })).toBeInTheDocument();
  });

  it("renders a character name as a link to its detail page", () => {
    render(
      <TermSheetProvider>
        <RuleText>Pomstí se na Pirátce? Ne — Pirátka uteče.</RuleText>
      </TermSheetProvider>,
    );
    const link = screen.getByRole("link", { name: "Pirátka" });
    expect(link).toHaveAttribute("href", "/postavy/piratka");
  });
});
