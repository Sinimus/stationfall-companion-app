import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sections } from "@/data";
import { SectionList } from "@/components/section-list";

describe("SectionList", () => {
  it("lists all sections as links", () => {
    render(<SectionList sections={sections} />);
    expect(screen.getAllByRole("link")).toHaveLength(41);
  });
  it("filters to dark sections", async () => {
    const user = userEvent.setup();
    render(<SectionList sections={sections} />);
    await user.click(screen.getByRole("button", { name: "Temná" }));
    expect(screen.getAllByRole("link")).toHaveLength(7);
  });
});
