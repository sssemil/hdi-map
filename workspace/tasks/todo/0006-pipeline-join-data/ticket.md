# Pipeline: Join SHDI Data to GeoJSON

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

Join the parsed SHDI CSV data to the GeoJSON features using GDL-Codes. Produce a join report documenting match quality.

### Steps (TDD)

1. RED: Test that matching GDL-Codes produce a joined feature with all properties
2. GREEN: Implement the join
3. RED: Test that CSV records without matching geometry are reported
4. GREEN: Implement mismatch reporting
5. RED: Test that geometry features without CSV data get null HDI values
6. GREEN: Handle unmatched geometries
7. RED: Test join report format (matched, csv-only, geo-only counts and lists)
8. GREEN: Generate join report
9. RED: Test hard failure threshold (if match rate < 95%, throw error)
10. GREEN: Implement threshold check

### Output

- Enriched GeoJSON FeatureCollection: each feature's properties now include all RegionProperties fields
- Join report JSON: `{ matched: number, csvOnly: string[], geoOnly: string[], matchRate: number }`

## Acceptance Criteria

- [ ] Successful join with >95% match rate (or fail with clear error)
- [ ] Join report produced with match/mismatch counts and lists
- [ ] Matched features have complete RegionProperties (validated against schema)
- [ ] Unmatched geometries retained with null HDI values
- [ ] CSV records without geometry are listed in report (data exists but no polygon)
- [ ] 100% test coverage on join logic and reporting

## Implementation Notes

- GDL-Code format may differ between CSV and shapefile (case, whitespace, leading zeros). Normalize before joining.
- The join is a left join on the GeoJSON: keep all geometries, attach CSV data where available.
- Log warnings for each mismatch to help diagnose data quality issues.
- The join report is a human-reviewed artifact — it should be readable and saved to disk.

## Dependencies

- Blocked by: 0003 (schema), 0004 (parsed CSV), 0005 (GeoJSON)
- Blocks: 0007, 0008

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
