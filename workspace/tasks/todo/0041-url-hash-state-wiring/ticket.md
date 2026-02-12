# URL hash state wiring

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

Wire the `url-state.ts` module (task 0029) into the app:

1. **On page load**: Parse `window.location.hash` to determine initial index/dimension. If non-HDI, load that index's data first (show loading spinner, NOT HDI flash).
2. **On index/dimension change**: Update `window.location.hash` via `history.replaceState` (no page reload).
3. **On `popstate` event**: Read hash, switch to the specified index/dimension (handles browser back/forward).

## Acceptance Criteria

- [ ] Page load with `#index=whr` shows WHR (not HDI then switch)
- [ ] Page load with `#index=oecd-bli&dim=health` shows OECD Health dimension
- [ ] Page load with invalid hash defaults to HDI silently
- [ ] Index/dimension changes update URL hash
- [ ] Browser back/forward switches indices
- [ ] No page reloads on hash changes

## Implementation Notes

- Use `history.replaceState` for hash updates (avoids adding to browser history on every change)
- Use `popstate` event for back/forward navigation
- On initial load with non-HDI hash: show loading spinner, fetch data, then render. Don't render HDI first.
- Consider using `hashchange` event as fallback

## Dependencies

- Blocked by: 0029 (url-state module), 0037 (index switcher)
- Blocks: None
