# Pipeline: Build Optimized TopoJSON

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

Convert the merged GeoJSON (subnational + fallback) into an optimized TopoJSON file. Simplify geometries to meet the file size target. Add supplementary layers (graticule, ocean outline, Antarctica).

### Steps

1. Convert merged GeoJSON to TopoJSON via `topojson-server` (geo2topo)
2. Simplify with `topojson-simplify` using parameters determined by the spike (task 0001)
3. Quantize with `topojson-client` (topoquantize) for additional compression
4. Strip properties not in the schema (remove any shapefile attributes not needed)
5. Add supplementary TopoJSON objects:
   - `graticule`: pre-generated graticule GeoJSON (d3.geoGraticule10)
   - `ocean`: sphere outline for ocean fill
   - `antarctica`: Natural Earth Antarctic polygon (gray fill, no HDI data)
6. Measure final file size (raw + gzip)
7. Validate: file size < target, all regions present, no degenerate geometries

### Output

`public/world-hdi.topo.json` — the single bundled data file for the static site.

## Acceptance Criteria

- [ ] TopoJSON generated with all subnational + fallback features
- [ ] Geometries simplified with parameters from spike
- [ ] Gzipped file size < 3 MB
- [ ] All GDL-Codes with HDI data still have non-degenerate geometry (area > 0)
- [ ] Small islands retained (--filter-detached=false or equivalent)
- [ ] Supplementary layers included (graticule, ocean, antarctica)
- [ ] Properties stripped to schema-only fields
- [ ] File is valid TopoJSON (parseable by topojson-client)

## Implementation Notes

- Use the simplification parameters determined during the spike. Do not guess.
- The `--filter-detached=false` flag in toposimplify retains small detached polygons (islands).
- After simplification, run validation: iterate all features, check `d3.geoArea(feature) > 0`.
- Graticule can be pre-generated as GeoJSON and included as a separate TopoJSON object.
- Antarctica: use Natural Earth 50m or 110m Antarctic polygon.
- Consider the pipeline as a single executable script: `npm run build-data` that runs all steps in sequence.

## Dependencies

- Blocked by: 0001 (simplification parameters), 0003 (schema for property stripping), 0007 (merged GeoJSON)
- Blocks: 0009, 0010, 0012

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
