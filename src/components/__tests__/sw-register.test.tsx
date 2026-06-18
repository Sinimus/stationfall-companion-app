import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SWRegister } from "@/components/sw-register";

describe("SWRegister", () => {
  it("renders nothing and does not throw when serviceWorker is unavailable", () => {
    const { container } = render(<SWRegister />);
    expect(container).toBeEmptyDOMElement();
  });
});
