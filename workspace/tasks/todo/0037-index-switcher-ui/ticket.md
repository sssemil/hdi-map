# Index switcher UI (dropdown)

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

Create an index switcher `<select>` dropdown at `top:16px;left:16px`. Push the existing palette picker to `top:52px;left:16px` (or below the index selector).

Options: "Human Development Index" | "World Happiness Report" | "OECD Better Life Index"

On change:
1. Load the selected index's value file (via value-loader, with caching)
2. Update the renderer's `getValue` accessor
3. Update the color scale with the index's bin definitions
4. Rebuild the legend with the index's title and bins
5. Update the tooltip formatter
6. Update URL hash

## Acceptance Criteria

- [ ] Index dropdown renders at top-left, above palette picker
- [ ] Three options listed with correct labels
- [ ] Selecting an index triggers data load + full UI update
- [ ] HDI is pre-selected on page load
- [ ] Switching back to a previously loaded index is instant (cached)
- [ ] All existing functionality preserved when HDI is selected

## Implementation Notes

- Follow the `createPalettePicker` pattern (native `<select>`)
- The onChange handler is the core orchestration point for the entire feature
- Must coordinate with task 0042 (loading UX) for the async data fetch
- Style matching existing glass-morphism: `background:rgba(10,10,46,0.9);color:#e0e0e0;border:1px solid rgba(255,255,255,0.15)`

## Dependencies

- Blocked by: 0023, 0026, 0036
- Blocks: 0038
