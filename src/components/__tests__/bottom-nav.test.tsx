import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/bottom-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/glosar" }));

describe("BottomNav", () => {
  it("renders the four destinations", () => {
    render(<BottomNav />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    for (const label of ["Postavy", "Glosář", "Průvodci", "Hledat"]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
    }
  });
  it("marks the active route with aria-current", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: /Glosář/ })).toHaveAttribute("aria-current", "page");
  });
});
