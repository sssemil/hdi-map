# Update info panel with all data sources

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Update `createInfoPanel` in `src/app.ts` to list all three data sources at all times (regardless of active index):

- **HDI Data**: Global Data Lab, Subnational HDI v8.3 (Zenodo DOI: 10.5281/zenodo.17467221)
- **Boundaries**: GDL Shapefiles V6.5
- **World Happiness Report**: Helliwell et al. (2025), World Happiness Report 2025. Free data download.
- **OECD Better Life Index**: OECD Regional Well-Being. CC BY 4.0.
- **Supplemental**: Taiwan (DGBAS), Hong Kong & San Marino (UNDP HDR)
- **Projection**: Robinson (via d3-geo-projection)
- License/attribution notes per data source

## Acceptance Criteria

- [ ] Info panel lists HDI, WHR, and OECD data sources with proper attribution
- [ ] WHR citation follows academic format
- [ ] OECD attribution includes CC BY 4.0 mention
- [ ] Panel is not excessively long (use collapsible sections if needed)

## Dependencies

- Blocked by: None
- Blocks: None
