# Pipeline — extract `hdi-values.json` from existing TopoJSON

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Add a pipeline step to extract HDI values from the existing `regions.topo.json` into a separate `hdi-values.json` file.

Read `public/data/regions.topo.json`, extract `{ [gdlCode]: { hdi, educationIndex, healthIndex, incomeIndex, year } }` for each region, and write to `public/data/hdi-values.json`.

## Acceptance Criteria

- [ ] `hdi-values.json` generated in `public/data/`
- [ ] Keyed by `gdlCode`, values match existing TopoJSON properties
- [ ] File validates against `HdiValuesSchema` from task 0027
- [ ] Pipeline script can be run via `npm run build:data`
- [ ] File size is reasonable (<100KB)

## Implementation Notes

- Add to `pipeline/build.ts` or create `pipeline/build-hdi-values.ts`
- Read from the already-built `regions.topo.json` (runs after existing pipeline)
- Include supplement values (Taiwan 0.926, HK 0.956, San Marino 0.915)

## Dependencies

- Blocked by: 0027 (value schema)
- Blocks: 0036
