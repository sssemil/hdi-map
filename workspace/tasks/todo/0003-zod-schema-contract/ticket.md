# Define Zod Schema: TopoJSON Data Contract

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 1

## Description

Define the Zod schema for TopoJSON feature properties. This is the shared contract between the data pipeline (Job 2) and the map renderer (Job 1). Both must agree on this schema.

### Schema

```typescript
const RegionPropertiesSchema = z.object({
  gdlCode: z.string(),
  name: z.string(),
  country: z.string(),
  countryIso: z.string().length(3),
  level: z.enum(["subnational", "national"]),
  year: z.number().int(),
  hdi: z.number().min(0).max(1).nullable(),
  educationIndex: z.number().min(0).max(1).nullable(),
  healthIndex: z.number().min(0).max(1).nullable(),
  incomeIndex: z.number().min(0).max(1).nullable(),
  centroid: z.tuple([z.number(), z.number()]),
});
```

### Steps (TDD)

1. RED: Write tests for schema validation — valid region, null HDI, invalid values, boundary values
2. GREEN: Implement the schema
3. RED: Write tests for a structural TopoJSON validator (checks objects keys, type, sample features)
4. GREEN: Implement structural validator
5. Export schema and types for use by both pipeline and renderer
6. Create a test factory function `getMockRegionProperties()` that validates against the schema

### File Location

`src/schemas/region-properties.schema.ts` — shared between pipeline and renderer.

## Acceptance Criteria

- [ ] Zod schema defined and exported
- [ ] Type `RegionProperties` derived from schema via `z.infer`
- [ ] Schema validates correctly: valid data passes, invalid data fails with descriptive errors
- [ ] Structural TopoJSON validator checks: `type === "Topology"`, expected `objects` key exists, sample features have required properties
- [ ] Factory function `getMockRegionProperties()` returns valid data validated against schema
- [ ] 100% test coverage on schema validation logic
- [ ] Schema is importable from both `src/` (renderer) and `pipeline/` (pipeline)

## Implementation Notes

- The schema must match the actual field names from the spike findings. If the spike reveals different field names or additional required fields, update accordingly.
- `centroid` is pre-computed by the pipeline (not computed at runtime). It's [longitude, latitude] for search zoom-to.
- `hdi` is nullable because some regions in the shapefile may lack HDI data entirely.
- The `level` field distinguishes subnational data from country-level fallback.
- Consider placing the schema in a shared location (e.g., `src/schemas/`) that both the pipeline and renderer can import.

## Dependencies

- Blocked by: 0001 (spike confirms field names), 0002 (project scaffolding)
- Blocks: 0004, 0006, 0008, 0009, 0010, 0011, 0013

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
