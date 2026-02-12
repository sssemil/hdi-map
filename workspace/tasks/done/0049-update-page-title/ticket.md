# Update page title and viewport message

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Update `index.html`:
- Change `<title>` from "Subnational Human Development Index Map" to something index-agnostic (e.g., "Global Well-Being Index Map")
- Update the small-viewport message to remove HDI-specific "1,800+ subnational regions" text
- Optionally: dynamically update `document.title` when index changes (e.g., "Global Well-Being Map — World Happiness Report")

## Acceptance Criteria

- [ ] Page title is index-agnostic or dynamically updated
- [ ] Small-viewport message is generic

## Dependencies

- Blocked by: None
- Blocks: None
