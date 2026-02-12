# Pipeline: Merge Country-Level Fallback Data

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

For countries without subnational SHDI data (~30-34 countries), add country-level polygons from Natural Earth admin-0 with UNDP country-level HDI values.

### Steps (TDD)

1. RED: Test identification of countries needing fallback (in UNDP data but not in SHDI subnational)
2. GREEN: Compute the set difference
3. RED: Test that Natural Earth admin-0 boundaries are loaded and filtered to fallback countries
4. GREEN: Load and filter NE boundaries
5. RED: Test that fallback features have `level: "national"` and correct HDI values from UNDP
6. GREEN: Enrich fallback features with UNDP data
7. RED: Test that fallback features are merged into the main GeoJSON FeatureCollection
8. GREEN: Merge
9. RED: Test edge case: country exists in SHDI with partial subnational coverage (some regions have data, some don't)
10. GREEN: Handle partial coverage (regions without data keep null HDI; don't fallback to country-level for partial countries)

### Data Sources

- Natural Earth admin-0 countries: `ne_110m_admin_0_countries.shp` (public domain, ~800 KB)
- UNDP country-level HDI: download from hdr.undp.org or use a bundled CSV

### Output

Merged GeoJSON FeatureCollection with:
- ~1,800 subnational features (from task 0006)
- ~30-34 national features (fallback countries) with `level: "national"`
- Report of which countries use fallback

## Acceptance Criteria

- [ ] Fallback countries identified (list documented)
- [ ] Natural Earth admin-0 boundaries loaded for fallback countries only
- [ ] Fallback features have `level: "national"`, UNDP HDI value, correct country name/ISO
- [ ] Centroids computed for fallback features
- [ ] Partial-coverage countries handled correctly (no double-counting)
- [ ] Merged FeatureCollection contains both subnational and national features
- [ ] 100% test coverage

## Implementation Notes

- Natural Earth 110m resolution is sufficient for country-level polygons (very lightweight)
- UNDP HDI may not have sub-indices (education, health, income) in the same format as SHDI. Set sub-indices to null for fallback countries.
- The tooltip will display "Country-level data (subnational unavailable)" for fallback regions — this is handled in the renderer, not the pipeline. The pipeline just sets `level: "national"`.
- Be careful with ISO codes: ensure NE and UNDP use the same ISO-3 codes for matching.

## Dependencies

- Blocked by: 0006 (joined subnational data tells us which countries are covered)
- Blocks: 0008

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
