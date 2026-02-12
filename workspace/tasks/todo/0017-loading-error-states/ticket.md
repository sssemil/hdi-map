# Loading and Error States

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 3

## Description

Implement loading spinner during data fetch/parse/render, and error state with retry on failure.

### States

1. **Loading**: Centered spinner on dark background with "Loading HDI data..." text
2. **Error**: Centered error message with "Failed to load map data" and a "Retry" button
3. **Loaded**: Map visible, spinner removed
4. **Small viewport**: "This map is best viewed on a desktop or landscape tablet" message (< 768px)

### Steps (TDD)

1. RED: Test that loading state renders spinner element
2. GREEN: Implement loading state
3. RED: Test that error state renders message + retry button
4. GREEN: Implement error state
5. RED: Test that retry triggers data reload
6. GREEN: Wire retry button
7. RED: Test viewport check shows fallback message on small screens
8. GREEN: Implement viewport check (CSS media query or JS check)
9. Wire into app.ts: show loading → load data → on success: render map → on error: show error

## Acceptance Criteria

- [ ] Loading spinner visible during data fetch
- [ ] Error message + retry button on fetch failure
- [ ] Retry re-attempts data load
- [ ] Spinner removed after successful render
- [ ] Small viewport (< 768px) shows friendly message instead of broken map
- [ ] All states visually tested

## Implementation Notes

- Keep it simple: CSS-only spinner (no library needed).
- The loading/error states are just CSS class toggles on a container div.
- The viewport check can be a CSS media query that shows/hides the appropriate content.
- Error messages should be user-friendly, not technical stack traces.

## Dependencies

- Blocked by: 0002 (project scaffolding), 0010 (data loader)
- Blocks: None (can be built in parallel with renderer)

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
