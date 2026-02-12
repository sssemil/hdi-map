# Module: Interactive Legend

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 4

## Description

Renders a discrete legend showing the 8 HDI color bins. Hover-to-highlight: hovering a legend bin dims all non-matching regions on the map.

### Legend Layout

Vertical stack, positioned bottom-left or top-right:
```
[color swatch] 0.900+  Very High
[color swatch] 0.850 - 0.899  Very High
[color swatch] 0.800 - 0.849  Very High
[color swatch] 0.700 - 0.799  High
[color swatch] 0.650 - 0.699  Medium
[color swatch] 0.550 - 0.649  Medium
[color swatch] 0.450 - 0.549  Low
[color swatch] < 0.450  Low
[gray swatch]  No data
```

### Steps

1. Render legend using bins from `color-scale.ts` (`HDI_BINS` export)
2. Add "No data" entry with gray swatch
3. On hover over a legend entry: call `mapRenderer.highlightRegions({ min, max })` to dim non-matching regions
4. On mouse leave from legend: call `mapRenderer.highlightRegions(null)` to restore all
5. Style: semi-transparent dark background panel, white text, small color swatches

### API

```typescript
const createLegend = (options: {
  container: HTMLElement;
  bins: readonly HdiBin[];
  noDataColor: string;
  onHighlight: (range: { min: number; max: number } | null) => void;
}) => void;
```

## Acceptance Criteria

- [ ] All 8 bins rendered with correct colors and labels
- [ ] "No data" entry rendered
- [ ] Hover on bin highlights matching regions (dims others to 20% opacity)
- [ ] Mouse leave restores all regions to full opacity
- [ ] Legend positioned without occluding critical map areas
- [ ] Readable on dark background (sufficient contrast)
- [ ] Visual testing confirms interaction

## Implementation Notes

- The legend is pure HTML/CSS, not SVG. Simpler to style and position.
- Import `HDI_BINS` and `NO_DATA_COLOR` from `color-scale.ts`.
- The highlight callback is provided by the app orchestrator — the legend doesn't know about the map renderer directly.
- Consider making the legend collapsible on smaller viewports (≥768px but still limited space).

## Dependencies

- Blocked by: 0002, 0011 (color scale bins), 0012 (renderer provides highlight method)
- Blocks: None

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
