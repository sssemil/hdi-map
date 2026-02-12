# PLAN-0002: Multi-Index Toggle (WHR + OECD BLI)

**Created**: 2026-02-12
**Status**: Ready for implementation

## Summary

Add World Happiness Report (WHR) and OECD Better Life Index (BLI) as toggleable index layers alongside the existing HDI choropleth map. Users switch between indices via nested dropdowns. OECD BLI exposes all 11 dimensions individually plus a user-configurable weighted composite with 11 interactive sliders. Data architecture uses shared geometry with lightweight per-index value overlays for efficient lazy loading.

## Requirements

### Data Sources
- **WHR**: 168 countries (most recent year per country), Cantril Ladder 0-10 scale, 6 sub-factors. Excel from worldhappiness.report. Country-level only — all subnational regions within a country show same color.
- **OECD BLI**: 509 TL2 regions across 41 OECD countries, 11 dimensions (0-10 scale each). Excel from oecdregionalwellbeing.org. Subnational where TL2-to-GDL mapping exists, country-level fallback elsewhere. CC BY 4.0 license.

### Index Switching
- Nested dropdowns: first selects index (HDI | WHR | OECD BLI), second appears only for OECD BLI
- OECD BLI second control: 11 individual dimensions + "Weighted Average" option
- When "Weighted Average" selected: 11 range sliders appear for dimension weighting (auto-normalize to 100%)
- HDI is default on page load

### Color Scale
- Custom bin definitions per index (different ranges, labels, boundaries)
- HDI: 8 bins, 0-1 range, UNDP classification labels (existing)
- WHR: ~6-7 bins, effective range ~1.5-8.0, custom labels
- OECD BLI: ~6-7 bins, 0-10 range, custom labels
- Palette picker continues to work independently of index selection

### Data Architecture (Shared Geometry + Value Overlay)
- Existing `regions.topo.json` serves as shared geometry (loaded once, ~8MB)
- Per-index lightweight JSON value files:
  - `hdi-values.json` — `{ [gdlCode]: { hdi, educationIndex, healthIndex, incomeIndex, year } }`
  - `whr-values.json` — `{ [countryIso]: { score, gdpPerCapita, socialSupport, lifeExpectancy, freedom, generosity, corruption, year } }`
  - `oecd-bli-values.json` — `{ [gdlCode]: { income, jobs, housing, education, health, environment, safety, civicEngagement, accessToServices, community, lifeSatisfaction } }`
- WHR keyed by `countryIso` (country-level). Renderer maps each region's `countryIso` to WHR score.
- OECD keyed by `gdlCode` where TL2-to-GDL mapping exists, with country-level fallback via `countryIso`.
- HDI value file extracted from existing `regions.topo.json` properties during pipeline build.

### URL State
- URL hash encodes index and OECD dimension: `#index=whr`, `#index=oecd-bli&dim=health`
- Invalid/missing hash defaults to HDI
- Browser back/forward navigation switches indices
- Palette not persisted in URL (out of scope)

### UI Adaptations
- Legend: title, bins, and labels change per index
- Tooltip: format and sub-indices change per index (HDI shows classification + 3 sub-indices, WHR shows score + 6 sub-factors, OECD shows selected dimension score)
- Info panel: lists all three data sources with proper attribution at all times
- Search: geography-based, works across all indices (regions don't change)
- OECD BLI shows muted "OECD member countries only" note near legend

### Cross-Index Supplements
- Best-effort lookup for Taiwan, Hong Kong, San Marino in WHR/OECD data
- Gray if unavailable for a given index

## Scope

### In Scope
- Index registry with typed definitions per index
- Index switcher UI (nested dropdowns)
- OECD dimension selector (11 dimensions + weighted average)
- 11 interactive weight sliders for OECD weighted average
- WHR pipeline: Excel → country-name-to-ISO mapping → JSON value file
- OECD pipeline: Excel → TL2-to-GDL crosswalk → JSON value file
- TL2-to-GDL crosswalk table (~200 entries, manually curated)
- WHR country-name-to-ISO mapping table (~168 entries)
- Custom bin definitions per index
- Generalized color scale (parameterized by bin definitions)
- Generalized map renderer (configurable value accessor)
- Generalized tooltip (per-index formatter)
- Lazy loading of value files with caching
- URL hash state management
- Updated info panel with all data sources
- Per-index supplements

### Out of Scope
- Side-by-side comparison of indices
- Historical data / time slider
- SPI (Social Progress Index) — paid data
- New geometry (reuse existing subnational paths)
- Palette in URL hash
- Mobile viewport support

## Anti-Goals
- Must NOT slow down initial HDI page load
- Must NOT break existing HDI functionality or 122+ tests
- Must NOT mix data sources within a single view
- Must NOT ship without proper attribution for WHR and OECD

## Non-Negotiables
1. HDI is the default view on page load
2. No performance regression on initial load (value files lazy-loaded)
3. All existing tests continue passing; new code developed with TDD

## Design

### Architecture

**Shared geometry + value overlay pattern:**
```
regions.topo.json (8MB, geometry + base props: gdlCode, name, country, countryIso, level, centroid)
  ├── hdi-values.json (~60KB, keyed by gdlCode)
  ├── whr-values.json (~10KB, keyed by countryIso)
  └── oecd-bli-values.json (~50KB, keyed by gdlCode with countryIso fallback)
```

The renderer loads geometry once, then swaps a value lookup function on index change.

**Index Registry** (`src/index-registry.ts`):
Central configuration per index — ID, label, data URL, bin definitions, value accessor, tooltip formatter, attribution, dimensions (OECD only).

**Value accessor pattern:**
```typescript
type ValueAccessor = (gdlCode: string, countryIso: string) => number | null;
```
- HDI: lookup by `gdlCode` in hdi-values map
- WHR: lookup by `countryIso` in whr-values map
- OECD BLI: lookup by `gdlCode` first, fall back to `countryIso`

### Data Model

**Base RegionProperties** (unchanged in TopoJSON):
```typescript
{ gdlCode, name, country, countryIso, level, centroid }
```
The `hdi`, `educationIndex`, `healthIndex`, `incomeIndex`, `year` fields remain in the TopoJSON for backward compatibility but are NOT used for rendering. Instead, value files are the source of truth.

**Per-index value files** (new JSON, generated by pipeline):
```typescript
// hdi-values.json
type HdiValues = Record<string, {
  hdi: number | null;
  educationIndex: number | null;
  healthIndex: number | null;
  incomeIndex: number | null;
  year: number;
}>;

// whr-values.json (keyed by countryIso)
type WhrValues = Record<string, {
  score: number | null;
  gdpPerCapita: number | null;
  socialSupport: number | null;
  lifeExpectancy: number | null;
  freedom: number | null;
  generosity: number | null;
  corruption: number | null;
  year: number;
}>;

// oecd-bli-values.json (keyed by gdlCode, with countryIso fallbacks)
type OecdBliValues = Record<string, {
  income: number | null;
  jobs: number | null;
  housing: number | null;
  education: number | null;
  health: number | null;
  environment: number | null;
  safety: number | null;
  civicEngagement: number | null;
  accessToServices: number | null;
  community: number | null;
  lifeSatisfaction: number | null;
}>;
```

### API Surface

No external API — this is a static webpage. Internal module boundaries:
- `index-registry.ts` — index definitions, lookup
- `value-loader.ts` — fetch + cache per-index value files
- `url-state.ts` — parse/update URL hash
- `weighted-average.ts` — compute OECD weighted composite from 11 dimensions + weights
- Updated: `color-scale.ts`, `map-renderer.ts`, `tooltip.ts`, `app.ts`
- Pipeline: `pipeline/build-whr.ts`, `pipeline/build-oecd.ts`, `pipeline/build-hdi-values.ts`

### UI Changes

**Index switcher** (top-left, above palette picker):
- `<select>` for index (HDI | World Happiness Report | OECD Better Life Index)
- When OECD selected: second `<select>` for dimension (11 dimensions + "Weighted Average")
- When "Weighted Average" selected: slider panel with 11 labeled range inputs

**Weight sliders panel**:
- Appears below the OECD dimension dropdown
- 11 labeled sliders (0-100 range)
- Auto-normalize: when user adjusts one, others scale proportionally to sum to 100
- Compact design matching existing glass-morphism style
- "Reset" button to restore equal weights

**Legend**: Receives `title` parameter from index registry. Bins come from per-index bin definitions.

**Tooltip**: Per-index formatter. HDI: classification + 3 sub-indices. WHR: score + 6 sub-factors. OECD: selected dimension score (or weighted average).

**Info panel**: Always shows all three data sources.

## Assumptions & Open Questions

### Confirmed Assumptions
- WHR data file pinned at `spike/data/whr-2025-figure-2.1.xlsx` (149 KB)
- OECD data file pinned at `spike/data/OECD-Regional-Well-Being-Data-File.xlsx` (604 KB)
- WHR uses most recent available year per country (168 countries, not just 147 with 2024)
- OECD TL2-to-GDL crosswalk is manually curated (~200 entries)
- Many-to-one mapping for boundary mismatches (multiple GDL regions get same OECD score)
- Countries with no GDL geometry (Bulgaria, Croatia) fall back to country-level

### Open Questions (Deferred)
- Exact WHR bin boundaries (to be determined during implementation based on data distribution)
- Exact OECD bin boundaries (same)
- Whether to persist OECD weights in URL hash (deferred to follow-up)

## Implementation Phases

### Phase 1: Non-Breaking Refactors (no behavior change, all tests green)
- 0019: Rename `HdiBin` to `Bin`, extract `HDI_BIN_DEFINITIONS`
- 0020: Parameterize `createColorScale` to accept bin definitions
- 0021: Extract value accessor in `map-renderer.ts`
- 0022: Generalize `highlightRegions` to use value accessor
- 0023: Add `title` parameter to `createLegend`
- 0024: Fix `data-loader.ts` immutability violation
- 0025: Generalize tooltip with per-index formatter function

### Phase 2: Index Registry & Value Architecture
- 0026: Create `index-registry.ts` with HDI definition
- 0027: Create Zod schemas for per-index value files
- 0028: Create `value-loader.ts` (fetch + cache value files)
- 0029: Create `url-state.ts` (parse/update URL hash)

### Phase 3: Data Pipelines
- 0030: Pipeline — extract `hdi-values.json` from existing TopoJSON
- 0031: Pipeline — strip HDI-specific fields from `regions.topo.json` (geometry-only)
- 0032: Pipeline — WHR name-to-ISO mapping table
- 0033: Pipeline — WHR Excel → `whr-values.json`
- 0034: Pipeline — OECD TL2-to-GDL crosswalk table
- 0035: Pipeline — OECD Excel → `oecd-bli-values.json`

### Phase 4: Runtime Integration
- 0036: Wire value-loader into app.ts (replace direct property access with value lookup)
- 0037: Index switcher UI (dropdown)
- 0038: OECD dimension selector UI
- 0039: OECD weighted average computation module
- 0040: OECD weight sliders UI (11 sliders with auto-normalization)
- 0041: URL hash state wiring (read on load, update on change, handle popstate)
- 0042: Lazy loading with loading/error UX (dimmed map + spinner overlay, toast on error)

### Phase 5: Per-Index Content
- 0043: WHR bin definitions and color scale
- 0044: WHR tooltip formatter
- 0045: OECD BLI bin definitions and color scale
- 0046: OECD BLI tooltip formatter
- 0047: Update info panel with all data sources
- 0048: Cross-index supplements (Taiwan, HK, San Marino in WHR/OECD)
- 0049: Update page title and viewport message
- 0050: OECD coverage note near legend

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data architecture | Shared geometry + value overlay | Avoids 3x geometry download (~24MB). Value files are <100KB each. |
| OECD join strategy | Many-to-one crosswalk table | Maximizes subnational coverage for all 41 OECD countries |
| OECD composite | Interactive weighted average (11 sliders) | Gives users maximum control over composite weighting |
| WHR year handling | Most recent per country | Maximizes coverage to 168 countries (vs 147 for 2024-only) |
| Schema strategy | Keep existing schema unchanged, overlay values separately | Zero disruption to existing HDI pipeline and tests |
| SPI | Dropped | Paid data, not freely redistributable |
| URL state | Hash params for index + dimension | Shareable links, browser navigation |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OECD crosswalk errors | M | M | Manual curation + validation tests per country |
| WHR name matching failures | L | L | Exhaustive mapping table with 168 entries, tested |
| France boundary mismatch confusion | M | L | Tooltip shows "Data from Grand Est region" or similar |
| Weight slider UX complexity | M | M | Default to equal weights, "Reset" button, compact design |
| Large total asset size | L | M | Value files are <100KB; geometry is cached after first load |
| WHR license ambiguity | L | M | Academic citation in info panel, non-commercial project |

## Implementation Notes

- Phase 1 refactors are independently shippable and must not change behavior — each gets its own commit
- The `data-loader.ts` mutation fix (0024) should use `.map()` instead of in-place property assignment
- The renderer value accessor (0021) replaces all 4 `d.properties.hdi` references with `getValue(d.properties.gdlCode, d.properties.countryIso)`
- Weight sliders should auto-normalize: when user moves one slider, others scale proportionally to maintain sum = 100
- Cancel in-flight D3 transitions (zoom, highlight) when switching indices to avoid visual corruption
- The OECD crosswalk table should be a tested, version-controlled JSON file in `pipeline/data/`
- The WHR name-to-ISO mapping table should similarly be a tested JSON file in `pipeline/data/`

## Acceptance Criteria

- [ ] User can toggle between HDI, WHR, and OECD BLI via dropdown
- [ ] HDI is the default view on page load with no performance regression
- [ ] OECD BLI shows second dropdown for dimension selection (11 dimensions + Weighted Average)
- [ ] Weighted Average option shows 11 interactive sliders that auto-normalize to 100%
- [ ] Each index has its own bin boundaries, labels, and color scale
- [ ] WHR colors all subnational regions within a country uniformly
- [ ] OECD BLI shows subnational data where crosswalk exists, country fallback elsewhere
- [ ] Other index data loads lazily with visual loading feedback (dimmed map + spinner)
- [ ] Failed index fetch shows non-destructive error and reverts to previous index
- [ ] Loaded index data is cached (re-selecting is instant)
- [ ] URL hash encodes selected index and OECD dimension
- [ ] Browser back/forward navigation switches indices
- [ ] Legend title and bins update per index
- [ ] Tooltip format adapts per index (HDI: classification + sub-indices, WHR: score + sub-factors, OECD: dimension score)
- [ ] Info panel lists all three data sources with proper attribution
- [ ] OECD view shows muted "OECD member countries only" note
- [ ] Palette switching works independently of index selection
- [ ] Search works across all indices
- [ ] All 122+ existing tests pass
- [ ] New code has full test coverage via TDD
