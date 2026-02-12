# Module: Color Scale

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 3

## Description

Pure function module: maps an HDI value to a color string using the Plasma sequential palette with 8 discrete bins.

### Bins

| Bin | HDI Range | Color (Plasma approximate) |
|-----|-----------|---------------------------|
| 1 | < 0.450 | Darkest (deep purple) |
| 2 | 0.450 - 0.549 | Dark purple |
| 3 | 0.550 - 0.649 | Purple-pink |
| 4 | 0.650 - 0.699 | Pink-red |
| 5 | 0.700 - 0.799 | Orange |
| 6 | 0.800 - 0.849 | Yellow-orange |
| 7 | 0.850 - 0.899 | Yellow |
| 8 | 0.900+ | Bright yellow |

*Exact colors from D3's `d3.interpolatePlasma` at evenly spaced sample points.*

### Steps (TDD)

1. RED: Test that HDI values at bin boundaries return the correct color
2. GREEN: Implement threshold scale using d3-scale-chromatic Plasma
3. RED: Test null HDI returns a "no data" color (gray)
4. GREEN: Handle null
5. RED: Test edge cases: HDI = 0, HDI = 1, HDI = 0.450 (boundary)
6. GREEN: Handle edges
7. RED: Test that the bins array is exported (for the legend to use)
8. GREEN: Export bins metadata

### API

```typescript
type HdiBin = {
  min: number;
  max: number;
  color: string;
  label: string; // e.g., "Very High (0.900+)"
};

const getColor = (hdi: number | null): string;
const HDI_BINS: readonly HdiBin[];
const NO_DATA_COLOR: string;
```

## Acceptance Criteria

- [ ] Correct color for each bin
- [ ] Null HDI → gray
- [ ] Boundary values handled correctly (inclusive/exclusive)
- [ ] Bins metadata exported for legend
- [ ] Pure function, no side effects
- [ ] 100% test coverage

## Implementation Notes

- Use `d3-scale-chromatic`'s `interpolatePlasma` to sample 8 colors evenly.
- Alternatively, use `d3.scaleThreshold()` with explicit domain and range.
- The "no data" color should be a neutral gray (#555 or similar) that reads on dark background.
- Bin labels should include UNDP classification: "Low", "Medium", "High", "Very High".
- Exact breakpoints may be adjusted after seeing actual data distribution (noted in plan). Parameterize if easy.

## Dependencies

- Blocked by: 0002 (project scaffolding), 0003 (schema — to understand HDI value range)
- Blocks: 0012, 0016

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
