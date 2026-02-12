# Pipeline: Convert Shapefile to GeoJSON

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

Convert the GDL Shapefiles V6.5 to GeoJSON format suitable for joining with SHDI data and converting to TopoJSON.

### Steps

1. Determine conversion method based on spike findings (ogr2ogr vs npm shapefile)
2. Convert shapefile(s) to GeoJSON, preserving the GDL-Code attribute
3. Verify CRS is WGS84 (EPSG:4326) — reproject if needed
4. Pre-compute centroids for each region (store as [lon, lat])
5. Validate: all features have a GDL-Code attribute, geometry is valid

### Output

GeoJSON FeatureCollection with all subnational regions, each feature having at minimum:
- `properties.gdlCode` (or whatever the field is named — discovered in spike)
- `geometry` (Polygon or MultiPolygon)
- Pre-computed centroid

## Acceptance Criteria

- [ ] Shapefile converted to GeoJSON successfully
- [ ] CRS is WGS84 (reprojected if needed)
- [ ] All features have GDL-Code attribute
- [ ] Centroids computed for all features
- [ ] No invalid geometries (self-intersections, etc.)
- [ ] Feature count matches expected (~1,800 regions)

## Implementation Notes

- The shapefile may be a single file or multiple files (one per country). The spike will clarify.
- ogr2ogr command: `ogr2ogr -f GeoJSON output.geojson input.shp`
- If using npm shapefile: `npx shp2json input.shp > output.geojson`
- Centroid computation: use turf.js `centroid()` or D3's `d3.geoCentroid()`
- This step may require significant disk space (GeoJSON can be 2-3x larger than shapefile)
- Consider writing a Node.js script rather than shell commands for reproducibility

## Dependencies

- Blocked by: 0001 (spike reveals shapefile structure and conversion method)
- Blocks: 0006

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
