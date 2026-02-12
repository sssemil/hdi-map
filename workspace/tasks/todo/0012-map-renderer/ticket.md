# Module: Map Renderer

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 3

## Description

Core rendering module. Loads TopoJSON data via the data loader, creates a Robinson projection, and renders all SVG paths colored by HDI. Also renders supplementary layers (graticule, ocean, Antarctica).

### Steps

1. Create SVG element sized to container
2. Set up Robinson projection with `d3-geo-projection`, fitted to container dimensions
3. Create `d3.geoPath()` generator from projection
4. Render ocean fill (sphere path, light blue fill)
5. Render graticule lines (low opacity white strokes)
6. Render Antarctica (gray fill)
7. Render all region paths, colored by `getColor(feature.properties.hdi)`
8. Render country-level outlines on top for context (thin stroke)
9. Handle window resize: refit projection and re-render

### API

```typescript
const createMapRenderer = (options: {
  container: HTMLElement;
  data: LoadResult;
  colorScale: (hdi: number | null) => string;
}) => MapRenderer;

type MapRenderer = {
  render: () => void;
  resize: () => void;
  getProjection: () => GeoProjection;
  getPathGenerator: () => GeoPath;
  getSvg: () => SVGSVGElement;
  highlightRegions: (filter: { min: number; max: number } | null) => void;
  highlightSingle: (gdlCode: string | null) => void;
};
```

## Acceptance Criteria

- [ ] Robinson projection renders correctly (matches reference map shape)
- [ ] All ~1,800 regions rendered as colored SVG paths
- [ ] Graticule, ocean, Antarctica rendered
- [ ] Regions colored correctly by HDI using color scale
- [ ] "No data" regions rendered in gray
- [ ] Country-level fallback regions visually present
- [ ] Container resize triggers re-render
- [ ] `highlightRegions` dims non-matching regions (for legend hover)
- [ ] `highlightSingle` raises stroke on a specific region (for hover)
- [ ] Renders within performance budget (< 1 second for rendering alone)

## Implementation Notes

- This is a side-effectful module — test via visual inspection and integration tests, not unit tests on DOM structure.
- Use D3 data joins (`selectAll().data().join()`) for efficient rendering.
- SVG layer order matters: ocean → graticule → Antarctica → regions → outlines.
- Region paths should have `data-gdl-code` attributes for lookup.
- Use `d3.geoRobinson()` from `d3-geo-projection`.
- Fit projection to container: `projection.fitSize([width, height], { type: "Sphere" })`.
- For the highlight methods, toggle CSS classes or change opacity directly.

## Dependencies

- Blocked by: 0002, 0008 (data), 0010 (data loader), 0011 (color scale)
- Blocks: 0013, 0014, 0015, 0016, 0017

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
