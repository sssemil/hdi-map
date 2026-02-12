# Pipeline — strip HDI-specific fields from `regions.topo.json`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Modify the pipeline to strip HDI-specific value fields from `regions.topo.json` properties, keeping only base geographic identity fields: `gdlCode`, `name`, `country`, `countryIso`, `level`, `centroid`.

The HDI values now live in the separate `hdi-values.json` (task 0030). The TopoJSON becomes geometry-only with minimal metadata, shared across all indices.

## Acceptance Criteria

- [ ] `regions.topo.json` properties contain only: `gdlCode`, `name`, `country`, `countryIso`, `level`, `centroid`
- [ ] No `hdi`, `educationIndex`, `healthIndex`, `incomeIndex`, `year` in TopoJSON properties
- [ ] File size decreases (fewer properties per geometry)
- [ ] All runtime code uses `hdi-values.json` for HDI values (not TopoJSON properties)
- [ ] Update `RegionPropertiesSchema` to match the slimmed-down base properties

## Implementation Notes

- This MUST be done after task 0036 (wire value-loader) so the runtime no longer reads from TopoJSON properties
- Update `RegionPropertiesSchema` to remove HDI-specific fields
- Update `getMockRegionProperties` factory
- Update all tests that reference HDI fields in region properties
- The supplement patching in `data-loader.ts` no longer modifies properties (supplements are per-index value patches)

## Dependencies

- Blocked by: 0030, 0036 (must have value-loader wired before stripping props)
- Blocks: None (polish step)
