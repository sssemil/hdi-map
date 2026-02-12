# Pipeline: Validate Output TopoJSON

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

Final validation step for the data pipeline. Verify the output TopoJSON meets all quality requirements before it is used by the renderer.

### Steps (TDD)

1. RED: Test that TopoJSON is parseable and has expected structure
2. GREEN: Implement structural validation
3. RED: Test that all features have properties conforming to RegionPropertiesSchema
4. GREEN: Validate all feature properties against Zod schema
5. RED: Test that no features have degenerate geometry (area > 0)
6. GREEN: Implement geometry validation
7. RED: Test that region count matches expected (subnational + fallback)
8. GREEN: Implement count validation
9. RED: Test that file size is within budget
10. GREEN: Implement size check
11. RED: Test that HDI values are within valid range and match source data (spot-check)
12. GREEN: Implement spot-check validation

### Output

Validation report: pass/fail with details on any failures.

## Acceptance Criteria

- [ ] All features pass Zod schema validation
- [ ] No degenerate geometries
- [ ] Region count matches expected
- [ ] Gzipped file size < 3 MB
- [ ] HDI values spot-checked against source CSV (at least 10 random regions)
- [ ] Supplementary layers present (graticule, ocean, antarctica)
- [ ] Validation runs as part of `npm run build-data` pipeline
- [ ] 100% test coverage on validation functions

## Implementation Notes

- This is the last step before the TopoJSON is committed to the repo / placed in `public/`.
- Spot-check: randomly select 10 regions, look up their HDI in the original CSV, verify the TopoJSON value matches.
- Consider running this validation in CI if the pipeline is automated.

## Dependencies

- Blocked by: 0003 (schema), 0008 (built TopoJSON)
- Blocks: 0010 (data loader can only be tested with validated data)

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
