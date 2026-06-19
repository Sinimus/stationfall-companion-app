# Report 031: Service worker — register only in production, self-clean in dev

## Status: DONE

## Files changed

### `src/components/__tests__/sw-register.test.tsx`
Replaced the single-test stub with three tests covering all required branches:
1. `renders nothing and does not throw when serviceWorker is unavailable` — passes with no navigator stub.
2. `registers the service worker in production` — stubs `NODE_ENV=production`, verifies `register("/sw.js")` called; `getRegistrations` not called.
3. `does not register in development and unregisters any stale worker + clears caches` — stubs `NODE_ENV=development` with one registration and one cache key `sf-v1`; verifies `unregister` called, `register` not called, `cacheDelete` called with `"sf-v1"`.

### `src/components/sw-register.tsx`
Rewrote the component to branch on `process.env.NODE_ENV`:
- **Production:** `navigator.serviceWorker.register("/sw.js")` (unchanged behaviour).
- **Development:** calls `getRegistrations()` and `unregister()` on each, then `caches.keys()` / `caches.delete()` for every cache key. No `register` call.
- Guard: early return when `serviceWorker` not in navigator.

## Test output

```
Test Files  24 passed (24)
     Tests  71 passed (71)
  Duration  2.45s
```

All 71 tests pass (70 pre-existing + 1 test promoted to 3 in sw-register suite = net +2 tests, all green).

## Lint output

```
> eslint
(zero warnings, zero errors)
```

## Build output

```
✓ Compiled successfully in 1433ms
✓ Generating static pages using 9 workers (87/87) in 211ms
```

Exported 87 static pages. Zero TypeScript errors. Zero warnings.

## Deviations

None. Implementation matches the task snippets verbatim.
