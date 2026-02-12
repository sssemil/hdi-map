# Lazy loading with loading/error UX

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

Define the UX for async data loading when switching indices:

**Loading state**: Keep current map visible but dimmed (opacity 0.5). Show a small spinner overlay centered on the map. Disable the index dropdown to prevent rapid switching.

**Success state**: Remove spinner, restore opacity, update colors/legend/tooltip. Re-enable dropdown.

**Error state**: Remove spinner, restore previous index view, show a non-destructive toast notification ("Failed to load World Happiness Report data. Try again later."). Re-enable dropdown, revert its value to previous index.

**Race condition**: If user switches index while a previous load is in-flight, cancel the previous load (or ignore its result when it completes).

## Acceptance Criteria

- [ ] Map dims with spinner overlay during index data fetch
- [ ] Index dropdown disabled during fetch
- [ ] On success: smooth transition to new index view
- [ ] On error: reverts to previous index, shows toast
- [ ] Rapid switching doesn't cause visual corruption
- [ ] In-flight D3 transitions (zoom/highlight) cancelled on index switch

## Implementation Notes

- Use `AbortController` to cancel in-flight fetches on rapid switching
- Cancel D3 transitions with `.interrupt()` on the SVG `g` element
- Clear the 3-second `highlightSingle` timeout (app.ts line 388) on index switch
- Toast can be a simple absolutely-positioned div that auto-dismisses after 5 seconds
- The dimming + spinner is separate from the initial `showLoadingState` (which replaces the entire container)

## Dependencies

- Blocked by: 0037 (index switcher), 0028 (value-loader)
- Blocks: None
