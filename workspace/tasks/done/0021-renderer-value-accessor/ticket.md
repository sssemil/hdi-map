# Extract value accessor in `map-renderer.ts`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

Replace all 4 hardcoded `d.properties.hdi` references in `src/map-renderer.ts` with a configurable value accessor function.

Add `getValue` to `MapRendererOptions`:

```typescript
type MapRendererOptions = {
  // ... existing fields
  readonly getValue: (gdlCode: string, countryIso: string) => number | null;
};
```

Update `renderRegions` (line 94), `updateColors` (line 188), and the `getColor`/`updateColors` signatures to use `getValue` instead of direct property access.

For backward compatibility during this refactor, `app.ts` passes `getValue: (gdlCode) => regionPropertiesMap.get(gdlCode)?.hdi ?? null` or equivalent.

## Acceptance Criteria

- [ ] `MapRendererOptions` includes `getValue` function
- [ ] `renderRegions` uses `getValue(d.properties.gdlCode, d.properties.countryIso)` instead of `d.properties.hdi`
- [ ] `updateColors` method generalized: takes a `(value: number | null) => string` color function and uses `getValue` for value extraction
- [ ] All existing tests pass
- [ ] TypeScript strict mode clean

## Implementation Notes

- Lines 94, 188: `.attr('fill', (d) => currentGetColor(d.properties.hdi))` → `.attr('fill', (d) => currentGetColor(currentGetValue(d.properties.gdlCode, d.properties.countryIso)))`
- Store `getValue` as `let currentGetValue` (same pattern as `let currentGetColor`)
- Add `updateValues` method to `MapRenderer` type for swapping the accessor on index change
- The `getColor` and `updateColors` signatures change from `(hdi: number | null) => string` to `(value: number | null) => string`

## Dependencies

- Blocked by: None
- Blocks: 0022, 0036
