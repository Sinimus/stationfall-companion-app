import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { SWRegister } from "@/components/sw-register";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("SWRegister", () => {
  it("renders nothing and does not throw when serviceWorker is unavailable", () => {
    const { container } = render(<SWRegister />);
    expect(container).toBeEmptyDOMElement();
  });

  it("registers the service worker in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = vi.fn().mockResolvedValue(undefined);
    const getRegistrations = vi.fn().mockResolvedValue([]);
    vi.stubGlobal("navigator", { serviceWorker: { register, getRegistrations } });

    render(<SWRegister />);
    await vi.waitFor(() => expect(register).toHaveBeenCalledWith("/sw.js"));
    expect(getRegistrations).not.toHaveBeenCalled();
  });

  it("does not register in development and unregisters any stale worker + clears caches", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const register = vi.fn();
    const unregister = vi.fn().mockResolvedValue(true);
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }]);
    const cacheDelete = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("navigator", { serviceWorker: { register, getRegistrations } });
    vi.stubGlobal("caches", { keys: vi.fn().mockResolvedValue(["sf-v1"]), delete: cacheDelete });

    render(<SWRegister />);
    await vi.waitFor(() => expect(unregister).toHaveBeenCalled());
    expect(register).not.toHaveBeenCalled();
    expect(getRegistrations).toHaveBeenCalled();
    expect(cacheDelete).toHaveBeenCalledWith("sf-v1");
  });
});
