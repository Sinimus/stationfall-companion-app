import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { characters } from "@/data";
import { CharacterList } from "@/components/character-list";

describe("CharacterList", () => {
  it("lists all characters as links", () => {
    render(<CharacterList characters={characters} />);
    expect(screen.getAllByRole("link")).toHaveLength(28);
  });

  it("filters by character type (Robot → 5 robots)", async () => {
    const user = userEvent.setup();
    render(<CharacterList characters={characters} />);
    await user.click(screen.getByRole("button", { name: "Robot" }));
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Strážce/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Agentka/ })).not.toBeInTheDocument();
  });

  it("filters by ability category and can reset", async () => {
    const user = userEvent.setup();
    render(<CharacterList characters={characters} />);
    await user.click(screen.getByRole("button", { name: "Konspirační" }));
    const filtered = screen.getAllByRole("link").length;
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(28);
    // toggling off restores the full list
    await user.click(screen.getByRole("button", { name: "Konspirační" }));
    expect(screen.getAllByRole("link")).toHaveLength(28);
  });
});
