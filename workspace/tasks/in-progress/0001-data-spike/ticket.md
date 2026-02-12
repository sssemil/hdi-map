# Data Spike: Validate Feasibility

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 0 (Critical Path)

## Description

This is the most critical task. Do NOT proceed with any application code until this spike is complete and its findings are reviewed.

The spike validates three things simultaneously:
1. **Data pipeline feasibility**: Can the 337.8 MB GDL shapefiles be converted and simplified into a < 3 MB gzipped TopoJSON?
2. **Rendering performance**: Can D3 SVG render ~1,800 paths smoothly with zoom/pan?
3. **Data join quality**: Do GDL-Codes in the SHDI CSV match the shapefile attributes?

### Steps

1. Download GDL Shapefiles V6.5.zip from Zenodo (DOI: 17467221) — 337.8 MB
2. Download SHDI CSV v8.3 from Zenodo — 11.7 MB
3. Read and document GDL license terms (check `https://globaldatalab.org/termsofuse/`)
4. Inspect shapefile structure: how many files, what attributes, what CRS, what GDL-Code field name
5. Inspect CSV structure: column names, encoding, latest year available, how many unique GDL-Codes
6. Convert shapefile to GeoJSON via `ogr2ogr` (install GDAL if needed) or npm `shapefile` package
7. Attempt join: match CSV GDL-Codes to shapefile GDL-Codes. Report: matched count, CSV-only codes, shapefile-only codes
8. Convert to TopoJSON at 3 simplification levels (aggressive, medium, light). Measure file sizes raw + gzipped
9. Create a bare-minimum `index.html` with D3 that renders each TopoJSON variant with Robinson projection. Measure: time to render, frame rate during pan/zoom, visual quality at 1x and 4x zoom
10. Document findings: file sizes, join match rate, rendering performance, visual quality assessment, disputed territory choices in the shapefile
11. **Decision gate**: proceed with SVG? pivot to Canvas? adjust simplification parameters?

### Output Artifacts

- `spike/findings.md` — documented results
- `spike/join-report.json` — match/mismatch counts and lists
- `spike/sample.topo.json` — a working sample TopoJSON at the chosen simplification level
- `spike/index.html` — bare D3 renderer for visual inspection

## Acceptance Criteria

- [ ] GDL shapefiles downloaded and inspected (structure, attributes, CRS)
- [ ] SHDI CSV downloaded and inspected (columns, encoding, latest year, GDL-Code count)
- [ ] GDL license terms documented
- [ ] Shapefile → GeoJSON conversion successful
- [ ] GDL-Code join attempted, match rate reported (target: >95%)
- [ ] TopoJSON generated at 3 simplification levels with measured file sizes
- [ ] Bare D3 SVG renderer built, performance measured
- [ ] Visual quality inspected at 1x and 4x zoom (especially small islands, dense European regions)
- [ ] Findings documented with clear go/no-go recommendation
- [ ] Decision on SVG vs Canvas made and justified

## Implementation Notes

- GDAL/ogr2ogr installation on Arch Linux: `sudo pacman -S gdal`
- If ogr2ogr fails or is unavailable, try npm `shapefile` package: `npx shp2json file.shp`
- For TopoJSON conversion: `npx geo2topo`, `npx toposimplify`, `npx topoquantize`
- The 337.8 MB shapefile may expand to 500 MB+ as GeoJSON — ensure sufficient disk space
- Check if GDL-Code field in shapefile has the same name/format as in the CSV (case, leading zeros, whitespace)
- Inspect disputed territories: how does the shapefile handle Kashmir, Crimea, Taiwan, Western Sahara?
- Pin the Zenodo DOI URLs for reproducibility

## Dependencies

- Blocked by: None
- Blocks: 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0011, 0012, 0013, 0014, 0015, 0016, 0017, 0018

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
- 2026-02-12 06:47 Started work on this task
