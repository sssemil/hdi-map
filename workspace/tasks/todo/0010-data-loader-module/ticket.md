# Module: Data Loader

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 3

## Description

Browser-side module that fetches the TopoJSON file, performs structural validation, and provides the parsed data to the renderer.

### Steps (TDD)

1. RED: Test that valid TopoJSON data is parsed and returned as typed features
2. GREEN: Implement TopoJSON loading with topojson-client
3. RED: Test structural validation: missing objects key, wrong type, missing properties on sample features
4. GREEN: Implement structural Zod validation (validate a sample of features, not all — for performance)
5. RED: Test fetch error handling (network error, 404, corrupt data)
6. GREEN: Implement error handling with descriptive error messages
7. RED: Test that the loader returns features grouped by layer (regions, graticule, ocean, antarctica)
8. GREEN: Implement layer extraction

### API

```typescript
type LoadResult = {
  regions: Feature<Geometry, RegionProperties>[];
  graticule: Feature;
  ocean: Feature;
  antarctica: Feature;
};

const loadMapData = async (url: string): Promise<LoadResult>
```

## Acceptance Criteria

- [ ] Fetches and parses TopoJSON from URL
- [ ] Structural validation on load (sample of features checked against Zod schema)
- [ ] Descriptive error on fetch failure, corrupt data, or schema mismatch
- [ ] Returns typed features grouped by layer
- [ ] 100% test coverage

## Implementation Notes

- Use `topojson-client`'s `feature()` function to convert TopoJSON objects to GeoJSON features.
- Structural validation should be fast: check the topology structure and validate ~10 random features (not all 1,800).
- In tests, use a small mock TopoJSON fixture (3-5 features) rather than the real data file.
- Error messages should be user-facing (shown in the error state UI).

## Dependencies

- Blocked by: 0002 (project scaffolding), 0003 (schema), 0008 (data available)
- Blocks: 0012

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
