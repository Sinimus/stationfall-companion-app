# TASK 013: PWA — installable + offline

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Make the app an installable, offline-capable PWA: a web manifest, an app icon, and a dependency-free
runtime-caching service worker registered on load.

## Design note

The service worker is a small hand-written `public/sw.js` (cache-first with network-update, resilient
precache via `allSettled`) — **not** Serwist. Rationale: deterministic, dependency-light, and
friction-free with `output: "export"` (the SW is just a static file). Build-time precaching of hashed
chunks (Serwist) is a possible v0.2 hardening. The SVG icon is a placeholder; branded PNG icons are v0.2.

## 2. Files

- Create: `src/app/manifest.ts` + `src/app/__tests__/manifest.test.ts`
- Create: `public/icon.svg`
- Create: `public/sw.js`
- Create: `src/components/sw-register.tsx` + `src/components/__tests__/sw-register.test.tsx`
- Modify: `src/app/layout.tsx` (icons + themeColor viewport + `<SWRegister/>`)

## 3. Implementation Steps (TDD)

- [ ] **Write failing tests**

  `src/app/__tests__/manifest.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import manifest from "@/app/manifest";

  describe("PWA manifest", () => {
    it("exposes installable fields", () => {
      const m = manifest();
      expect(m.name).toBe("Stationfall Companion");
      expect(m.start_url).toBe("/postavy");
      expect(m.display).toBe("standalone");
      expect(m.icons && m.icons.length).toBeGreaterThan(0);
    });
  });
  ```

  `src/components/__tests__/sw-register.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render } from "@testing-library/react";
  import { SWRegister } from "@/components/sw-register";

  describe("SWRegister", () => {
    it("renders nothing and does not throw when serviceWorker is unavailable", () => {
      const { container } = render(<SWRegister />);
      expect(container).toBeEmptyDOMElement();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/app/manifest` and `@/components/sw-register` do not exist.

- [ ] **Implement `src/app/manifest.ts`**:
  ```ts
  import type { MetadataRoute } from "next";

  export default function manifest(): MetadataRoute.Manifest {
    return {
      name: "Stationfall Companion",
      short_name: "Stationfall",
      description: "Pravidlový průvodce deskovkou Stationfall (Zkáza na orbitě).",
      start_url: "/postavy",
      display: "standalone",
      background_color: "#0a0a0a",
      theme_color: "#0a0a0a",
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    };
  }
  ```

- [ ] **Create `public/icon.svg`**:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
    <g fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round">
      <ellipse cx="256" cy="256" rx="150" ry="64" transform="rotate(-30 256 256)"/>
      <line x1="256" y1="116" x2="256" y2="396"/>
    </g>
    <circle cx="256" cy="256" r="40" fill="#ffffff"/>
  </svg>
  ```

- [ ] **Create `public/sw.js`**:
  ```js
  const CACHE = "sf-v1";
  const CORE = [
    "/",
    "/postavy",
    "/glosar",
    "/pruvodci",
    "/hledat",
    "/manifest.webmanifest",
    "/icon.svg",
  ];

  self.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        await Promise.allSettled(CORE.map((url) => cache.add(url)));
        await self.skipWaiting();
      })(),
    );
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
        await self.clients.claim();
      })(),
    );
  });

  self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(async () => cached || (await caches.match("/")) || Response.error());
        return cached || network;
      })(),
    );
  });
  ```

- [ ] **Implement `src/components/sw-register.tsx`**:
  ```tsx
  "use client";

  import { useEffect } from "react";

  export function SWRegister() {
    useEffect(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }, []);
    return null;
  }
  ```

- [ ] **Wire into `src/app/layout.tsx`**:
  - Add to the `metadata` object: `icons: { icon: "/icon.svg", apple: "/icon.svg" }`.
  - Export a viewport with theme color:
    ```tsx
    import type { Metadata, Viewport } from "next";
    export const viewport: Viewport = { themeColor: "#0a0a0a" };
    ```
  - Render `<SWRegister />` inside `<body>` (e.g. right after `<BottomNav />`); add its import.

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — manifest fields; SWRegister renders nothing without serviceWorker; all prior green.

- [ ] **Run linter & build, verify PWA assets**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; and these exist:
  - `out/manifest.webmanifest`, `out/sw.js`, `out/icon.svg`
  - `<link rel="manifest" ...>` present in `out/postavy.html`

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore` (TS files). `public/sw.js` is plain JS (worker
  globals) and is not part of the TS project — keep it framework-free.
- Do not modify data / `src/data/*` / `term-sheet.tsx`.
- Keep all existing tests passing. Do not register the SW during tests (the guard handles jsdom).

## 5. Acceptance Criteria

1. `pnpm test` passes (manifest + sw-register + all prior).
2. `pnpm lint` zero warnings; `pnpm build` emits `out/manifest.webmanifest`, `out/sw.js`, `out/icon.svg`,
   and links the manifest in the page HTML.
3. App is installable (manifest + icon + standalone) and registers the service worker on load.
4. Report written to `docs/blueprint/reports/report_013.md`.
