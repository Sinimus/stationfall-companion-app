import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { glossary } from "@/data";
import { TermSheetProvider } from "@/components/term-sheet";
import { GlossaryBrowser } from "@/components/glossary-browser";

function renderBrowser() {
  render(
    <TermSheetProvider>
      <GlossaryBrowser terms={glossary} />
    </TermSheetProvider>,
  );
}

describe("Glossary + TermSheet", () => {
  it("opens a term in the bottom-sheet", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    expect(within(dialog).getByText(/odjistí/)).toBeInTheDocument();
  });

  it("follows a seeAlso link to another term within the sheet", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    await user.click(within(dialog).getByRole("button", { name: "Evakuace" }));
    expect(screen.getByRole("dialog", { name: "Evakuace" })).toBeInTheDocument();
  });

  it("closes the sheet", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    await user.click(screen.getByRole("button", { name: "Zavřít" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("linkifies keywords inside the definition text", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    // The definition contains the word "autodestrukce" (a glossary term) — it must be a button.
    expect(within(dialog).getByRole("button", { name: "autodestrukce" })).toBeInTheDocument();
  });

  it("renders the definition in a constrained reading measure", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Antihmota" }));
    const dialog = screen.getByRole("dialog", { name: "Antihmota" });
    expect(dialog.querySelector(".measure")).not.toBeNull();
  });

  it("lists characters who start with the item (reverse lookup)", async () => {
    const user = userEvent.setup();
    renderBrowser();
    await user.click(screen.getByRole("button", { name: "Pistole" }));
    const dialog = screen.getByRole("dialog", { name: "Pistole" });
    expect(within(dialog).getByText("Startuje s ním")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Pirátka/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Strážce/ })).toBeInTheDocument();
  });
});
