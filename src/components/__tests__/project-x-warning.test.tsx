import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TermSheetProvider } from "@/components/term-sheet";
import { ProjectXWarning } from "@/components/project-x-warning";

describe("ProjectXWarning", () => {
  it("warns about a modifying Project X and opens its card", async () => {
    const user = userEvent.setup();
    render(
      <TermSheetProvider>
        <ProjectXWarning targetId="podezrely" />
      </TermSheetProvider>,
    );
    const btn = screen.getByRole("button", { name: "Bojové hejno" });
    await user.click(btn);
    expect(screen.getByRole("dialog", { name: "Bojové hejno" })).toBeInTheDocument();
  });

  it("renders nothing when the target is not modified", () => {
    render(
      <TermSheetProvider>
        <ProjectXWarning targetId="konspirator" />
      </TermSheetProvider>,
    );
    expect(screen.queryByText(/Modifikováno Projektem X/)).not.toBeInTheDocument();
  });
});
