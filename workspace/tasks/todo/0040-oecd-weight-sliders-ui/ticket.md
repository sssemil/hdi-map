# OECD weight sliders UI (11 sliders with auto-normalization)

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

When "Weighted Average" is selected in the OECD dimension dropdown, show a slider panel with 11 labeled range inputs. Each slider controls the weight for one dimension.

**Auto-normalization**: When the user adjusts one slider, the others scale proportionally so all weights sum to 100%. Include a "Reset" button that restores equal weights (100/11 ≈ 9.1% each).

**Design**: Compact panel matching existing glass-morphism style. Position below the dimension dropdown. Each row: dimension label (abbreviated if needed) + slider + percentage display.

On any slider change:
- Normalize weights
- Recompute weighted average for all regions
- Update map colors
- Update legend

## Acceptance Criteria

- [ ] 11 labeled sliders appear when "Weighted Average" selected
- [ ] Sliders hidden when a specific dimension or non-OECD index selected
- [ ] Moving one slider auto-adjusts others to maintain 100% total
- [ ] "Reset" button restores equal weights
- [ ] Map updates in real-time as sliders move
- [ ] Percentage display next to each slider
- [ ] Panel fits within viewport without obscuring map significantly

## Implementation Notes

- Use native `<input type="range">` elements (0-100 range, step 1)
- Auto-normalization algorithm: when slider X changes to new value V, scale all OTHER sliders proportionally so they fill the remaining (100-V)%. If V=100, set all others to 0.
- Debounce or throttle slider input events (map re-rendering is expensive)
- The slider panel can be quite tall (11 rows) — consider scrollable container or 2-column layout
- Style: same glass-morphism as legend/search controls

## Dependencies

- Blocked by: 0038 (dimension selector), 0039 (weighted average module)
- Blocks: None
