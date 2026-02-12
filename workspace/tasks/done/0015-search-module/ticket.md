# Module: Region Search

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 4

## Description

Two parts: (1) pure search function that filters regions by query, and (2) search UI (input + dropdown).

### Search Spec

- Text input positioned top-right of the map
- Case-insensitive, diacritics-insensitive substring matching
- Results formatted as "Region Name, Country"
- Top 10 results shown in dropdown
- Selecting a result: zooms to region + shows tooltip
- Escape or click-outside dismisses dropdown
- Empty query hides dropdown
- No results: show "No regions found"

### Steps (TDD)

1. RED: Test search function returns matching regions by name substring
2. GREEN: Implement substring search
3. RED: Test case insensitivity
4. GREEN: Normalize case
5. RED: Test diacritics insensitivity ("Ile" matches "Ile-de-France")
6. GREEN: Normalize diacritics using `String.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`
7. RED: Test result limit (max 10)
8. GREEN: Implement limit
9. RED: Test disambiguation format ("Punjab, India" vs "Punjab, Pakistan")
10. GREEN: Include country in result label
11. RED: Test empty query returns empty results
12. GREEN: Handle empty
13. RED: Test no matches returns empty array
14. GREEN: Handle no matches
15. Implement search UI (input, dropdown, event handlers) — visual testing
16. Wire selection to zoom controller's `zoomToRegion` and tooltip show

### API

```typescript
type SearchResult = {
  gdlCode: string;
  label: string; // "Region Name, Country"
  feature: Feature;
};

const searchRegions = (options: {
  query: string;
  regions: Feature<Geometry, RegionProperties>[];
  limit?: number;
}): SearchResult[];
```

## Acceptance Criteria

- [ ] Search function: case-insensitive substring matching
- [ ] Search function: diacritics-insensitive
- [ ] Search function: returns max 10 results
- [ ] Search function: results formatted as "Region, Country"
- [ ] UI: text input with placeholder "Search regions..."
- [ ] UI: dropdown appears on typing, hides on escape/click-outside
- [ ] UI: selecting a result zooms to region and shows tooltip
- [ ] UI: "No regions found" message when no matches
- [ ] 100% test coverage on the pure search function

## Implementation Notes

- Build the region search index at load time: extract name + country + gdlCode from all features.
- Pre-normalize names for search (lowercase, stripped diacritics) to avoid re-normalizing on every keystroke.
- The dropdown is a `<ul>` with `<li>` items, absolutely positioned below the input.
- Use `requestAnimationFrame` or debounce (50ms) on input to avoid excessive re-filtering.
- The search input should get keyboard focus with `/` or `Ctrl+K` shortcut.

## Dependencies

- Blocked by: 0002, 0003, 0010 (data loader), 0012 (renderer), 0014 (zoom controller for zoomToRegion)
- Blocks: None

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
