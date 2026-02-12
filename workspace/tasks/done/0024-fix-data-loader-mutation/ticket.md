# Fix `data-loader.ts` immutability violation

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

`data-loader.ts` lines 72-77 mutate `target.properties` in-place:

```typescript
for (const supplement of REGION_SUPPLEMENTS) {
  const target = regions.find((r) => r.properties.gdlCode === supplement.gdlCode);
  if (target) {
    target.properties = supplement.properties;
  }
}
```

Refactor to produce a new array using `.map()`:

```typescript
const regionsWithSupplements = regions.map(r => {
  const supplement = supplementsByCode.get(r.properties.gdlCode);
  return supplement ? { ...r, properties: supplement.properties } : r;
});
```

## Acceptance Criteria

- [ ] `loadMapData` returns immutably-derived regions (no in-place mutation)
- [ ] All existing `data-loader.test.ts` tests pass
- [ ] Supplements still applied correctly (Taiwan, HK, San Marino)

## Implementation Notes

- Build a `Map<string, RegionSupplement>` for O(1) lookup instead of `.find()` per supplement
- The `.map()` approach also naturally extends to per-index supplements later

## Dependencies

- Blocked by: None
- Blocks: 0036
