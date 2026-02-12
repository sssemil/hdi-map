# Add `title` parameter to `createLegend`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

The `createLegend` function in `src/app.ts` (line 58) hardcodes `title.textContent = 'Human Development Index'`. Add a `title` parameter so the legend title can change per index.

## Acceptance Criteria

- [ ] `createLegend` accepts a `title: string` parameter
- [ ] `app.ts` passes `'Human Development Index'` for HDI (preserving current behavior)
- [ ] Legend title renders the passed string
- [ ] All existing tests pass

## Implementation Notes

- Simple signature change: `createLegend(container, bins, onBinHover)` → `createLegend(container, title, bins, onBinHover)` or use options object
- Update the two call sites in `app.ts` (lines 368 and 375)

## Dependencies

- Blocked by: None
- Blocks: 0037
