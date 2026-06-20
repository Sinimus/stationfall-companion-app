# Report 033: Iconography — lucide icons as label complements

## Status: COMPLETE

## Files Changed

### New files
- `src/components/category-badge.tsx` — new component wrapping `CATEGORY_ICON`, `CATEGORY_BG_CLASS`, `CATEGORY_LABEL`; renders `<Icon aria-hidden /> label` inside a coloured `<span>`
- `src/components/__tests__/category-badge.test.tsx` — 2 tests: icon + label present; extra className merged

### Modified files

#### `src/lib/categories.ts`
- Added imports: `LucideIcon`, `Footprints`, `Shield`, `Swords`, `EyeOff`, `SlidersHorizontal`, `Sparkles`, `User`, `Bot`, `Database`, `Package` from `lucide-react`
- Added exports: `CATEGORY_ICON: Record<AbilityCategory, LucideIcon>` and `TYPE_ICON: Record<CharacterType, LucideIcon>`

#### `src/lib/sections.ts`
- Added imports: `LucideIcon`, `CircleDot`, `Circle`, `Orbit`, `Rocket`, `Star`, `ArrowDownToLine`, `Feather` from `lucide-react`
- Added exports: `ZONE_ICON: Record<SectionZone, LucideIcon>` and `GRAVITY_ICON: Record<Section["gravity"], LucideIcon>`

#### `src/components/character-dossier.tsx`
- Removed unused `CATEGORY_BG_CLASS`, `CATEGORY_LABEL` from import; added `TYPE_ICON` and `CategoryBadge` import
- `AbilityRow`: replaced inline category `<span>` with `<CategoryBadge category={ability.category} />`
- `CharacterDossier`: hoisted `const TypeIcon = TYPE_ICON[c.type]`; subtitle `<p>` changed to `flex items-center gap-1` with `<TypeIcon className="size-3.5" aria-hidden />` prefix

#### `src/components/term-sheet.tsx`
- Removed `CATEGORY_BG_CLASS`, `CATEGORY_LABEL` import; added `CategoryBadge` import
- Replaced inline category chip with `<CategoryBadge category={term.category} className="mb-2" />`

#### `src/components/character-list.tsx`
- Added `TYPE_ICON` to import from `@/lib/categories`
- Card subtitle: replaced plain `<span>` with `flex items-center gap-1` span containing IIFE-derived `<TypeIcon className="size-3" aria-hidden />` and label text

#### `src/components/section-list.tsx`
- Added `ZONE_ICON`, `GRAVITY_ICON` to import from `@/lib/sections`
- Zone group headers: `<h2>` becomes `flex items-center gap-1.5` with `<ZoneIcon className="size-3.5" aria-hidden />`
- Card subtitles: gravity `<span>` becomes `flex items-center gap-1` with `<GravIcon className="size-3" aria-hidden />`

#### `src/components/section-detail.tsx`
- Added `ZONE_ICON`, `GRAVITY_ICON` to sections import; added `Zap`, `SlidersHorizontal`, `Rocket`, `Moon` from `lucide-react`
- Hoisted `const ZoneIcon` and `const GravIcon` at top of component
- Subtitle `<p>`: restructured into inline spans with icons for zone, gravity, and dark status (Moon icon)
- Property badges: each badge wrapped in `inline-flex items-center gap-1` with respective icon (`Zap`, `SlidersHorizontal`, `Rocket`)

## Test / Lint / Build Output

### Tests
- Test Files: 25 passed (25)
- Tests: 75 passed (75)
- 2 new tests added (CategoryBadge); all 73 prior tests continue to pass
- No test-matcher adjustments needed

### Lint
- pnpm lint: zero warnings, zero errors

### Build
- Compiled successfully in 1347ms
- Generating static pages using 9 workers (87/87) in 175ms
- TypeScript check passed; zero warnings

## Deviations
None. All edits applied verbatim per task specification.
