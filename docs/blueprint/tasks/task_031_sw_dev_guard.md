# TASK 031: Service worker — register only in production, self-clean in dev

> **Status:** DONE
> **Assigned to:** Constructor (Sonnet sub-agent)

## 1. Goal

Kill the dev-mode infinite-reload loop. The hand-written `public/sw.js` does stale-while-revalidate
and caches `/`. After a dev restart (new build id), the SW keeps serving the **old** cached shell,
whose hashed `_next` chunks 404 against the new server → Next dev forces a full reload → SW serves
the stale shell again → infinite loop.

Fix: register the service worker **only in production**, and in development **actively unregister any
stale worker and clear its caches** so a browser that already installed the SW recovers on its next
load (no manual DevTools unregister needed).

> Production behaviour is unchanged — the SW still installs and runs for real users.

## 2. Files

- Modify: `src/components/sw-register.tsx`
- Modify: `src/components/__tests__/sw-register.test.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Add failing tests** — replace `src/components/__tests__/sw-register.test.tsx` with:
  ```tsx
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
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — current `SWRegister` always registers and never unregisters/clears.

- [ ] **Rewrite `src/components/sw-register.tsx`**:
  ```tsx
  "use client";

  import { useEffect } from "react";

  export function SWRegister() {
    useEffect(() => {
      if (!("serviceWorker" in navigator)) return;

      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
        return;
      }

      // Dev: žádný SW. Navíc zruš SW + cache z předchozí session — jinak stale shell
      // se starými _next chunky → Next dev vynutí reload → nekonečná smyčka.
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) void caches.delete(key);
        });
      }
    }, []);

    return null;
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — production registers; development unregisters + clears caches and does NOT
  register; the unavailable-serviceWorker case still no-ops; all prior green.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports. (Production bundle still wires the SW.)

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not edit `public/sw.js` or data files.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (prod registers; dev unregisters+clears, no register; unavailable no-op; all prior green).
2. `pnpm lint` zero warnings; `pnpm build` exports.
3. In dev the service worker is neither registered nor left active (stale SW from a prior session is
   torn down on next load); production SW behaviour unchanged.
4. Report written to `docs/blueprint/reports/report_031.md`.
