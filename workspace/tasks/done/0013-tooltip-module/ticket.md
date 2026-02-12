# Module: Tooltip

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 4

## Description

Two parts: (1) pure function that formats tooltip content from region properties, and (2) DOM controller that positions the tooltip near the cursor.

### Tooltip Content (5 lines max)

```
Ile-de-France, France          ← bold, line 1
HDI: 0.921 (Very High)         ← line 2, with color swatch
Education: 0.89                ← line 3
Health: 0.95                   ← line 4
Income: 0.91                   ← line 5
```

For country-level fallback:
```
North Korea                    ← bold, line 1
HDI: 0.733 (High)              ← line 2
Country-level data             ← line 3, italic, muted
```

### Steps (TDD)

1. RED: Test tooltip content formatter for subnational region
2. GREEN: Implement formatter
3. RED: Test formatter for country-level fallback (level === "national")
4. GREEN: Handle fallback — show note, omit sub-indices if null
5. RED: Test formatter for region with null HDI
6. GREEN: Handle "No data available" message
7. RED: Test HDI classification label ("Low", "Medium", "High", "Very High")
8. GREEN: Import classification from `hdi-classification.ts`
9. Implement tooltip DOM controller (positioning, show/hide) — visual testing

### API

```typescript
const formatTooltipContent = (properties: RegionProperties): string; // returns HTML
const createTooltipController = (container: HTMLElement) => {
  show: (html: string, x: number, y: number) => void;
  hide: () => void;
};
```

## Acceptance Criteria

- [ ] Tooltip content correctly formatted for subnational, national, and no-data regions
- [ ] HDI classification label included
- [ ] Tooltip positioned near cursor without overflowing viewport
- [ ] Tooltip appears on hover, disappears on mouseout
- [ ] 100% test coverage on the pure formatting function
- [ ] Visual testing confirms tooltip readability

## Implementation Notes

- The formatter is a pure function — fully TDD-able.
- The DOM controller is side-effectful — test visually.
- Tooltip is an absolutely positioned `<div>` with CSS styling, not an SVG element.
- Position tooltip offset from cursor (e.g., +10px right, +10px down). Flip if near edge.
- On the map renderer, attach `mouseenter`/`mouseleave` events to each region path.

## Dependencies

- Blocked by: 0002, 0003 (schema), 0012 (map renderer for event attachment)
- Blocks: None (can be wired in parallel with other interaction modules)

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
