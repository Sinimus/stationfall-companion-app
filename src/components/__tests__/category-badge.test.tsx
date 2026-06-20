import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge } from "@/components/category-badge";

describe("CategoryBadge", () => {
  it("shows the category label next to an icon (icon complements, not replaces)", () => {
    const { container } = render(<CategoryBadge category="utocne" />);
    expect(screen.getByText("Útočné")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });
  it("merges an extra className", () => {
    const { container } = render(<CategoryBadge category="obranne" className="mb-2" />);
    expect(container.firstChild).toHaveClass("mb-2");
  });
});
