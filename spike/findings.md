# Data Spike Findings

**Date**: 2026-02-12
**Task**: 0001-data-spike

## Summary

The spike validates that the project is **feasible**. The data pipeline works, the join quality is good, and the file sizes are well within budget. SVG rendering of 1,809 paths is viable. **Proceed with implementation.**

## 1. Data Sources

### SHDI CSV v8.3
- **Source**: Zenodo DOI 17467221
- **Size**: 11.7 MB
- **Rows**: 61,179 (header + 61,178 data rows)
- **Unique GDL-Codes**: 1,889 (1,800 subnational + 89 national/duplicates)
- **Columns**: 34 fields
  - System: `isocode3`, `country`, `continent`, `datasource`, `year`, `gdlcode`, `level`, `region`
  - HDI: `shdi`, `healthindex`, `edindex`, `incindex`
  - Gender: `sgdi`, `shdif`, `shdim`, etc.
  - Indicators: `lifexp`, `esch`, `msch`, `lgnic`, `pop`
- **Level values**: "National" and "Subnat" (not "Subnational")
- **Year range**: 1990-2022
- **Subnational regions with 2022 data**: 1,800
- **National entries with 2022 data**: 187
- **Encoding**: UTF-8, some quoted fields with commas in region names
- **Key field name**: `gdlcode` (lowercase)

### GDL Shapefiles V6.5
- **Source**: Zenodo DOI 17467221
- **Archive size**: 322 MB (zip), 636 MB (uncompressed .shp)
- **Format**: Single Shapefile ("GDL Shapefiles V6.5 large")
- **Features**: 1,809
- **Shape type**: Polygon / MultiPolygon
- **CRS**: WGS84 (EPSG:4326) — no reprojection needed
- **Attributes**: `gdlcode` (C, 10), `continent` (C, 12), `iso_code` (C, 10)
- **Key field name**: `gdlcode` (matches CSV exactly)
- **Unique ISO codes**: 197
- **National-level codes in shapefile**: 35 (small countries without subnational breakdown)

## 2. GDL License Terms

- **Non-commercial use**: Permitted ("any non-profit purpose")
- **Commercial use**: Requires written permission from Global Data Lab
- **Redistribution**: Permitted for non-profit with attribution
- **Attribution required**: Mention Global Data Lab as source + link to GDL website with data version
- **Shapefiles specifically**: Not explicitly mentioned, general "content" terms apply

**Decision**: Proceed with non-commercial use. Attribution will be included in the map credits.

## 3. GDL-Code Join Analysis

| Metric | Count |
|--------|-------|
| Shapefile codes | 1,809 |
| CSV subnational codes (2022) | 1,800 |
| **Matched** | **1,753** |
| CSV-only (no geometry) | 47 |
| Shapefile-only (no 2022 data) | 56 |
| **Match rate** | **96.9%** |

### CSV-only codes (47 regions with data but no geometry)
These are mostly newer administrative divisions added in SHDI v8.3 but not yet in Shapefiles V6.5. Examples: BELr105, ESPr117, ESPr118, FRAr125, FRAr126, KIRr101-r105, MDVr101-r106. These regions' data will be **lost** (no polygon to render).

### Shapefile-only codes (56 regions with geometry but no data)
- 35 are national-level codes (e.g., ANDt, BHRt, SGPt) — small countries in the shapefile without subnational SHDI data. These need **country-level HDI fallback** from UNDP.
- 21 are subnational regions that were likely redistricted or don't have 2022 data. These will render with **null HDI (gray)**.

**Assessment**: 96.9% is above the 95% threshold. The 47 CSV-only codes represent subnational detail we lose, but these are mostly small regions in countries that still have other subnational data. Acceptable for v1.

## 4. TopoJSON File Sizes

Conversion via `mapshaper` with `keep-shapes` flag (prevents region deletion):

| Simplification | Keep % | Raw Size | Gzip Size | Notes |
|----------------|--------|----------|-----------|-------|
| Light | 10% | 34 MB | 9.8 MB | Very detailed, too large |
| 3% | 3% | 11 MB | 3.5 MB | High quality, slightly over budget |
| **2%** | **2%** | **7.5 MB** | **2.4 MB** | **Good quality, within budget** |
| Medium | 1% | 4.2 MB | 1.4 MB | Acceptable quality, very small |
| Aggressive | 0.1% | 1.2 MB | 0.3 MB | Visible degradation |

**Recommendation**: Use **2% simplification** (2.4 MB gzipped). This provides good visual quality while staying well within the 3 MB budget. Features: 1,809 regions, 0 degenerate geometries.

## 5. SVG Rendering Performance

### Setup
- Vite dev server serving TopoJSON files
- D3.js with geoRobinson projection
- SVG rendering with 1,809 path elements
- Zoom/pan via d3.zoom (geometric transform)
- Hover tooltips with stroke highlight

### Results (local fetch, no network latency)
- **Fetch + Parse + Render**: Well under 1 second for all simplification levels
- **2% file**: ~16ms fetch, instant parse, fast render (local)
- **Zoom/pan**: Smooth geometric zoom (CSS transform on `<g>` group)
- **Hover**: Responsive, CSS `:hover` + JS event handlers work on all 1,809 paths

### Production Estimate (10 Mbps connection)
- 2.4 MB gzip transfer: ~200ms at 10 Mbps
- JSON parse + TopoJSON feature extraction: ~100ms
- D3 SVG render: ~200-400ms
- **Estimated total: ~500-700ms** — well under 3 second budget

### Assessment
**SVG rendering is viable** for 1,809 paths at this simplification level. Geometric zoom (transform on `<g>`) is smooth. No Canvas fallback needed.

## 6. Disputed Territory Choices

| Territory | Treatment in GDL Shapefile |
|-----------|---------------------------|
| Taiwan | NOT separate — likely part of China (CHN has 33 regions) |
| Kashmir | No separate ISO — split between IND (36), PAK (8), CHN (33) |
| Kosovo | Present as `KSV` (not standard `XKX`) |
| Palestine | Present as `PSE` with 6 regions |
| Western Sahara | NOT separate — likely under Morocco (MAR) |
| Crimea | Part of Ukraine (UKR has 5 regions) or Russia (RUS has 8 regions) — needs visual verification |
| Israel | Single national-level code (`ISRt`) |
| North Korea | Single national-level code (`PRKt`) |

**Decision**: Document these choices in the map credits/disclaimer. Do not modify. This is the data provider's representation.

## 7. Schema Field Mapping

Based on inspecting both the CSV and shapefile, the TopoJSON feature properties schema should map:

| Schema Field | CSV Column | Shapefile Column |
|-------------|-----------|-----------------|
| gdlCode | gdlcode | gdlcode |
| name | region | (not in shapefile — join from CSV) |
| country | country | (not in shapefile — join from CSV) |
| countryIso | isocode3 | iso_code |
| level | level ("Subnat"/"National") | (derive from gdlcode suffix 't') |
| year | year | (not in shapefile — join from CSV) |
| hdi | shdi | (not in shapefile — join from CSV) |
| educationIndex | edindex | (not in shapefile — join from CSV) |
| healthIndex | healthindex | (not in shapefile — join from CSV) |
| incomeIndex | incindex | (not in shapefile — join from CSV) |
| centroid | (computed from geometry) | (computed from geometry) |

**Note**: CSV column is `shdi`, not `hdi`. Schema should map `shdi` → `hdi`.
**Note**: CSV level values are "Subnat" and "National", not "subnational"/"national".

## 8. Decision Gate

### GO: Proceed with SVG rendering
- 1,809 paths render smoothly as SVG
- Geometric zoom is performant
- CSS hover + JS events work on all paths
- No Canvas fallback needed

### GO: 2% simplification
- 2.4 MB gzipped — well within 3 MB budget
- 1,809 features preserved, 0 degenerate
- Visual quality acceptable at 1x and 4x zoom
- `keep-shapes` flag prevents small region deletion

### GO: Data pipeline approach
- mapshaper handles the 636 MB shapefile efficiently
- GDL-Code join works at 96.9% match rate
- CSV parsing straightforward with proper handling of quoted fields
- CRS is WGS84 — no reprojection needed

### ACTION ITEMS for subsequent tasks
1. Schema field names confirmed — update Zod schema per section 7
2. Use mapshaper (not ogr2ogr) for shapefile processing — no GDAL dependency needed
3. CSV parsing must handle quoted fields with commas (use proper CSV parser, not naive split)
4. Level values in CSV are "Subnat"/"National" — normalize to "subnational"/"national" in pipeline
5. 35 national-level shapefile features need UNDP country-level HDI values
6. 47 CSV-only regions will have no geometry — document but accept for v1
7. Disputed territory choices are the data provider's — document, don't modify

## Artifacts

- `spike/join-report.json` — full join analysis
- `spike/data/gdl_2pct.topo.json` — recommended simplification level (sample)
- `spike/index.html` + `spike/spike-app.js` — bare D3 renderer for visual inspection
- `spike/findings.md` — this document
