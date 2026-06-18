import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Prose } from "@/components/prose";

describe("Prose", () => {
  it("wraps text in a constrained reading measure with relaxed leading", () => {
    render(<Prose>Dlouhá definice pravidla.</Prose>);
    const el = screen.getByText("Dlouhá definice pravidla.");
    expect(el).toHaveClass("measure");
    expect(el).toHaveClass("leading-relaxed");
  });
  it("merges an extra className", () => {
    render(<Prose className="mt-4">x</Prose>);
    expect(screen.getByText("x")).toHaveClass("mt-4");
  });
});
