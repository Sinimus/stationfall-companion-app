# Report 029: Character starting items + reverse lookup

## Files Changed

### `src/data/schema.ts`
Added optional `startItems?: string[]` field to the `Character` interface, after `startSection`, with a JSDoc comment explaining its purpose.

### `src/data/schemas.ts`
Added `startItems: z.array(z.string()).optional()` to `characterSchema` after `startSection` (before `.strict()`). This allows the Zod strict parser to accept the already-authored `startItems` arrays in `characters.json`.

### `src/lib/start-items.ts` (new file)
Created the reverse-lookup module. Builds a `Map<string, Character[]>` index at module load time by iterating `characters` and collecting each `startItems` id. Exports `charactersStartingWith(itemId: string): Character[]`. Imports only from `@/data` — no import cycle.

### `src/components/term-sheet.tsx`
Added import of `charactersStartingWith` from `@/lib/start-items`. Inserted a "Startuje s ním" block in the glossary branch, immediately after the "Objevuje se u" (`relatedCharacterIds`) block. The block renders only when `charactersStartingWith(term.id).length > 0`; each character link includes the `startSection` in parentheses if present.

### `src/lib/__tests__/start-items.test.ts` (new file)
Two tests: `pistole` returns exactly 3 characters (`piratka`, `plukovnik`, `strazce`); `antihmota` returns an empty array.

### `src/components/__tests__/term-sheet.test.tsx`
Appended one test inside the existing `describe`: opening "Pistole" shows the "Startuje s ním" label and links for Pirátka and Strážce.

### `src/data/__tests__/data.integrity.test.ts`
Added one integrity test: every `startItems` id in every character must resolve to a glossary id (using the existing `glossaryIds` set).

## Command Outputs

### `pnpm test`
```
Test Files  23 passed (23)
     Tests  67 passed (67)
  Duration  2.73s
```

### `pnpm lint`
```
(no output — zero warnings)
```

### `pnpm build`
```
Compiled successfully in 1059ms
Generating static pages using 9 workers (87/87) in 194ms
```
87 pages exported, zero TypeScript errors.

## Deviations from Task

None. All implementation steps followed exactly as specified.
