# Generalize `highlightRegions` to use value accessor

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

The `highlightRegions` method in `src/map-renderer.ts` (lines 128-139) hardcodes `d.properties.hdi` for filter comparison:

```typescript
const hdi = d.properties.hdi;
if (hdi === null) return 0.15;
return hdi >= filter.min && hdi < filter.max ? 1 : 0.15;
```

Replace with the `getValue` accessor from task 0021:

```typescript
const value = currentGetValue(d.properties.gdlCode, d.properties.countryIso);
if (value === null) return 0.15;
return value >= filter.min && value < filter.max ? 1 : 0.15;
```

## Acceptance Criteria

- [ ] `highlightRegions` uses `currentGetValue` instead of `d.properties.hdi`
- [ ] Legend bin hover highlighting works correctly (same behavior as before)
- [ ] All existing tests pass
- [ ] TypeScript strict mode clean

## Implementation Notes

- This is a 3-line change within `highlightRegions`
- Depends on 0021 having introduced `currentGetValue` into the renderer closure

## Dependencies

- Blocked by: 0021
- Blocks: 0036
