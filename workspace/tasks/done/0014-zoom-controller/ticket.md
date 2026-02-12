# Module: Zoom Controller

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 4

## Description

Implements zoom/pan behavior using D3 zoom, with button controls and constraints.

### Zoom Spec

- **Min zoom**: 1x (full world view)
- **Max zoom**: 10x
- **Pan constraints**: keep at least 30% of map visible in viewport
- **Controls**: +/- buttons, reset-to-world button
- **Mouse**: scroll wheel to zoom, click+drag to pan
- **Keyboard**: +/- keys for zoom
- **Double-click**: zoom in 2x centered on click point
- **Zoom-to-region**: method to zoom to a specific region's bounding box with 20% padding (used by search)

### Steps

1. Set up `d3.zoom()` behavior on the SVG element
2. Configure scale extent [1, 10]
3. Configure translate extent for pan constraints
4. Create zoom button UI (+, -, reset) positioned bottom-right
5. Implement zoom-to-region method using `d3.geoBounds()` + projection
6. Wire keyboard shortcuts
7. Ensure zoom interacts correctly with hover events (tooltip should still work while zoomed)

### API

```typescript
const createZoomController = (options: {
  svg: SVGSVGElement;
  projection: GeoProjection;
  onZoom: (transform: ZoomTransform) => void;
}) => {
  zoomToRegion: (feature: Feature) => void;
  resetZoom: () => void;
};
```

## Acceptance Criteria

- [ ] Scroll wheel zooms in/out smoothly
- [ ] Click+drag pans the map
- [ ] Zoom constrained to 1x-10x
- [ ] Pan constrained (map can't be dragged off-screen)
- [ ] +/- buttons zoom in/out
- [ ] Reset button returns to 1x world view
- [ ] Double-click zooms in 2x
- [ ] `zoomToRegion` zooms to bounding box with padding
- [ ] Tooltips work correctly at all zoom levels

## Implementation Notes

- Use geometric zoom (apply CSS transform) rather than semantic zoom (re-project) for performance.
- `d3.zoom().scaleExtent([1, 10]).translateExtent(...)` handles most constraints.
- The zoom transform is applied to a `<g>` group element containing all map paths, not individual paths.
- Button controls should call `svg.transition().call(zoom.scaleTo, ...)`.
- Test visually — zoom behavior is interaction-based and not unit-testable.

## Dependencies

- Blocked by: 0012 (map renderer provides SVG and projection)
- Blocks: 0015 (search uses zoomToRegion)

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
