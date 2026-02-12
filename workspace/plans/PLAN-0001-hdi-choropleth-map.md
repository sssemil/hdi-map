# PLAN-0001: Subnational HDI Choropleth World Map

**Created**: 2026-02-12
**Status**: Ready for implementation

## Summary

Build a static webpage that renders an interactive subnational HDI (Human Development Index) choropleth world map using D3.js with Robinson projection. The map displays ~1,800 regions across 161+ countries colored by HDI values using a Plasma sequential palette. Users can hover for tooltips, zoom/pan, search for regions, and interact with the legend. Data is pre-bundled as optimized TopoJSON.

Two standalone deliverables: (1) a data processing pipeline that converts raw SHDI CSV + shapefiles into optimized TopoJSON, and (2) a static webpage that renders and makes the map interactive.

## Requirements

### Core
- Subnational HDI choropleth world map at province/state/region level
- ~1,800 regions across 161+ countries (Global Data Lab SHDI dataset)
- Interactive: hover tooltips, zoom/pan, region search, interactive legend
- Robinson projection
- Pre-bundled TopoJSON with HDI values embedded
- Latest available year only
- Dark background aesthetic

### Data
- Primary source: Global Data Lab SHDI v8.3 (Zenodo DOI: 17467221)
- Fallback: UNDP country-level HDI for ~30-34 countries without subnational data
- Country-level fallback uses Natural Earth admin-0 boundaries (public domain)
- Fallback regions visually distinguished via tooltip note ("Country-level data")

### Visual
- Plasma sequential palette (viridis family) — CVD-safe, perceptually uniform
- 8 discrete bins: subdivide UNDP categories, especially 0.800+ range into 3 bins
- Graticule grid lines (15-degree intervals, low opacity)
- Ocean fill via projection outline
- Gray Antarctica polygon (Natural Earth)

### Interaction
- Hover: raise stroke to 2px white, bring to front, show tooltip
- Tooltip: Region Name, Country (bold) / HDI: value (classification) / Education: x / Health: x / Income: x
- Zoom/pan: mouse wheel + drag, +/- buttons, reset-to-world button, min 1x max 10x, constrained pan
- Search: text input, case/diacritics-insensitive substring match, top 10 dropdown as "Region, Country", zoom-to on selection
- Legend: discrete bins, hover-to-highlight (dim non-matching regions to 20% opacity)

### Technical
- Vanilla HTML/CSS/TypeScript + D3.js
- Vite build tool + Vitest test runner
- SVG rendering (validated by data spike; Canvas pivot if spike fails)
- Desktop-first: min viewport 768px, graceful message on smaller screens
- Gzip/brotli compression assumed for transfer size

## Scope

### In Scope
- Data pipeline (offline): SHDI CSV + GDL Shapefiles + NE admin-0 → optimized TopoJSON
- Map renderer: D3 + Robinson projection + SVG paths
- Interactive features: tooltips, zoom/pan, search, legend
- Responsive layout (≥768px)
- Loading spinner, error state on data load failure
- Graticule, ocean, Antarctica for visual completeness

### Out of Scope
- Time series / year slider
- Comparison features / ranking tables
- Data export / embed / download-as-image
- Mobile-optimized experience (<768px)
- Fuzzy search / multilingual search
- Region labels at zoom
- Click-to-filter on legend (hover-to-highlight only)

## Anti-Goals
- NOT a dashboard with charts, tables, and filters
- NOT a data collection or editing tool
- NOT a GIS application (no layers, measurement, satellite imagery)
- NOT a mobile-first application

## Non-Negotiables
1. **Data accuracy**: HDI values must match official SHDI data exactly. No fabrication.
2. **Performance**: Load + render < 3 seconds on 10 Mbps connection (gzip transfer size target: < 3 MB).

## Design

### Architecture

Two independent deliverables connected by a shared data contract (Zod schema):

```
Job 2: Data Pipeline (offline, Node.js)
  SHDI CSV + GDL Shapefiles + NE Admin-0 + UNDP HDI
    → parse, filter latest year, join on GDL-Code
    → merge country-level fallback
    → convert to TopoJSON, simplify, validate
    → output: world-hdi.topo.json (validated against schema)

Job 1: Map Renderer (browser, static site)
  world-hdi.topo.json (validated against schema at load)
    → D3 Robinson projection → SVG paths
    → color-scale.ts (pure: HDI → color)
    → tooltip.ts (pure: region properties → HTML)
    → region-search.ts (pure: query → matched regions)
    → map-renderer.ts (side-effectful: D3 orchestration)
    → legend.ts (discrete bins, hover-to-highlight)
    → zoom-controller.ts (D3 zoom behavior + controls)
```

### Data Contract (Zod Schema)

The TopoJSON feature properties schema — the contract between pipeline and renderer:

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

### Color Scale

Plasma sequential palette, 8 discrete bins:

| Bin | HDI Range | UNDP Category |
|-----|-----------|---------------|
| 1 | < 0.450 | Low |
| 2 | 0.450 - 0.549 | Low |
| 3 | 0.550 - 0.649 | Medium |
| 4 | 0.650 - 0.699 | Medium |
| 5 | 0.700 - 0.799 | High |
| 6 | 0.800 - 0.849 | Very High |
| 7 | 0.850 - 0.899 | Very High |
| 8 | 0.900+ | Very High |

*Exact breakpoints may be adjusted after seeing the actual HDI value distribution in the data.*

### Module Decomposition

Pure, testable modules (strict TDD):
- `src/schemas/region-properties.schema.ts` — Zod schema, shared contract
- `src/color-scale.ts` — HDI value → color string
- `src/tooltip.ts` — region properties → tooltip HTML string
- `src/region-search.ts` — query + region index → matched results
- `src/hdi-classification.ts` — HDI value → UNDP category label
- `src/data-loader.ts` — fetch + structural Zod validation of TopoJSON

Side-effectful modules (visual/integration testing):
- `src/map-renderer.ts` — D3 projection + SVG rendering orchestration
- `src/zoom-controller.ts` — D3 zoom behavior + button controls
- `src/legend.ts` — legend rendering + hover-to-highlight interaction
- `src/search-ui.ts` — search input + dropdown DOM management
- `src/app.ts` — entry point, wires modules together

Pipeline modules (strict TDD):
- `pipeline/parse-shdi.ts` — CSV parsing + latest-year filtering
- `pipeline/convert-shapefile.ts` — shapefile → GeoJSON
- `pipeline/join-data.ts` — GDL-Code join + fallback merge + join report
- `pipeline/build-topojson.ts` — GeoJSON → TopoJSON + simplification
- `pipeline/validate-output.ts` — schema validation + completeness check

## Assumptions & Open Questions

### Confirmed Assumptions
- GDL SHDI v8.3 from Zenodo is the canonical data source (pinned DOI)
- GDL Shapefiles V6.5 for subnational boundaries
- Natural Earth admin-0 (public domain) for country-level fallback boundaries
- Data processing is offline Node.js scripts, not runtime
- SVG rendering is viable for ~1,800 simplified paths (validated by spike)
- The 3-second target assumes gzip-compressed transfer (~3 MB budget)
- GDL data license permits non-commercial use and redistribution with attribution
- Vite + Vitest for build/test tooling

### Open Questions (Deferred)
- Exact GDL license terms for shapefile redistribution — verify during spike
- Disputed territory rendering (Kashmir, Crimea, Taiwan) — document GDL's choices during spike
- Whether all 1,800 regions have data for the same "latest year" — check during pipeline build

## Implementation Phases

### Phase 0: Data Spike (CRITICAL PATH)
Validate feasibility before any application code.
- Download GDL Shapefiles V6.5 + SHDI CSV v8.3 from Zenodo
- Check GDL license terms
- Convert shapefile to GeoJSON (ogr2ogr or npm shapefile)
- Attempt GDL-Code join — measure match rate
- Convert to TopoJSON at varying simplification levels
- Measure file sizes (raw + gzip)
- Render in bare D3 SVG — measure performance on 1,800 paths
- Visually inspect at 1x and 4x zoom
- Decision gate: proceed with SVG, pivot to Canvas, or adjust simplification

### Phase 1: Project Scaffolding
- Initialize Vite + TypeScript + Vitest project
- Define Zod schema for TopoJSON feature properties
- Set up CI-able test runner
- Create HTML shell with dark background

### Phase 2: Data Pipeline
- Parse SHDI CSV, filter to latest year per region
- Convert GDL shapefiles to GeoJSON
- Join CSV data to GeoJSON on GDL-Code (with join report)
- Merge country-level fallback (Natural Earth admin-0 + UNDP HDI)
- Convert to TopoJSON + simplify (parameters from spike)
- Validate: all regions have geometry, no degenerate polygons, schema passes
- Add graticule, ocean outline, Antarctica geometry
- Output: world-hdi.topo.json

### Phase 3: Map Rendering
- Load + validate TopoJSON (structural Zod check)
- Robinson projection with D3
- Render SVG paths colored by HDI via color scale
- Render graticule, ocean, Antarctica
- Loading spinner + error state
- Responsive container (≥768px), mobile fallback message

### Phase 4: Interactivity
- Hover: stroke highlight + tooltip
- Zoom/pan: D3 zoom behavior + button controls + bounds
- Search: text input + dropdown + zoom-to-region
- Legend: discrete bins + hover-to-highlight

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | SVG (validated by spike) | 1,800 paths within SVG threshold; native DOM events simplify interaction; Canvas pivot available |
| Color palette | Plasma (sequential, viridis family) | CVD-safe, perceptually uniform, correct for sequential data, reads well on dark background |
| Palette type | Sequential (not diverging) | HDI is unidirectional; diverging implies false neutral midpoint |
| Build tool | Vite + Vitest | TypeScript compilation, bundling, dev server, test runner in one tool; not a framework |
| Mobile | Desktop-first, ≥768px | Mobile choropleths with 1,800 regions have no good UX solution; ships faster |
| Data bundling | Single pre-built TopoJSON | Simplest static deployment; no runtime data fetching |
| Tooltip depth | 3 sub-indices only | Keeps tooltip scannable; sub-sub-indices add file size for marginal value |
| Search matching | Substring, not fuzzy | Simple, predictable; fuzzy matching is scope creep for v1 |
| TDD scope | Strict for pure modules; visual testing for D3 rendering | Pragmatic split; TDD where it provides value, visual QA where it doesn't |
| Fallback boundaries | Natural Earth admin-0 | Public domain, widely used, lightweight |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SVG too slow for 1,800 paths | Low | High | Data spike validates upfront; Canvas fallback ready |
| GDL-Code join has significant mismatches | Medium | Medium | Join report with hard failure threshold (>5%); human review |
| Simplification destroys small island regions | High | Medium | Validate all GDL-Codes have non-degenerate geometry; min-area threshold |
| GDL license blocks redistribution | Low | High | Check during spike; Natural Earth fallback available |
| File size exceeds 3 MB gzipped | Low | Medium | Tune simplification; strip unnecessary properties; quantization |
| Disputed territory controversy | Medium | Low | Document GDL's choices; add disclaimer if public |

## Implementation Notes

1. **Data spike is Phase 0** — do not write application code until the spike validates feasibility.
2. **Zod schema is the contract** — define it in Phase 1, import it in both pipeline and renderer.
3. **Pipeline produces a join report** — matched count, CSV-only codes, shapefile-only codes, fallback countries. Human-reviewed before accepting output.
4. **Simplification validation** — after topojson-simplify, verify every GDL-Code still has area > 0. Retain small islands with `--filter-detached=false`.
5. **Country-level fallback** — Natural Earth admin-0 boundaries for ~30 countries. Tooltip notes "Country-level data (subnational unavailable)". No hatching in v1.
6. **Disputed territories** — document which choices the GDL shapefiles make. No custom overrides in v1.
7. **GDAL dependency** — ogr2ogr may be needed for shapefile conversion. Document installation. Alternatively, convert once and commit the TopoJSON output.
8. **Gzip** — ensure the static host serves .json files with gzip/brotli. The 3-second target assumes compressed transfer.
9. **Hover feedback** — raise stroke to 2px white, `selection.raise()` to bring to front. Essential for dense regions.
10. **Graticule** — `d3.geoGraticule10()`, 10-degree intervals, rendered behind land paths, low-opacity white stroke on ocean.

## Acceptance Criteria

- [ ] Static webpage loads and renders a world map with ~1,800 subnational regions colored by HDI
- [ ] Robinson projection matches reference map shape
- [ ] Plasma sequential color scale with 8 discrete bins
- [ ] Hover on any region shows tooltip with: name, country, HDI (classification), 3 sub-indices
- [ ] Hover highlights region with white stroke
- [ ] Zoom/pan via mouse wheel + drag, with +/- and reset buttons
- [ ] Search input finds regions by name, zooms to selected result
- [ ] Legend shows discrete bins, hover-to-highlight dims non-matching regions
- [ ] Countries without subnational data show country-level HDI (fallback)
- [ ] Graticule grid lines, ocean fill, gray Antarctica rendered
- [ ] Loading spinner during data fetch, error message on failure
- [ ] Gzipped TopoJSON transfer < 3 MB
- [ ] Total load + render < 3 seconds on 10 Mbps connection
- [ ] All pure modules have 100% test coverage via TDD
- [ ] Desktop viewport ≥768px; smaller viewports show fallback message
- [ ] HDI values match official SHDI data exactly (verified by pipeline validation)
