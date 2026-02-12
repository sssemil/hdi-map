# OECD dimension selector UI

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

When OECD BLI is selected in the index switcher, show a second `<select>` dropdown below it with 12 options:

1. Income
2. Jobs
3. Housing
4. Education
5. Health
6. Environment
7. Safety
8. Civic Engagement
9. Access to Services
10. Community
11. Life Satisfaction (default)
12. Weighted Average

The dropdown is hidden when a non-OECD index is selected.

On dimension change:
- Update the renderer's `getValue` accessor to extract the selected dimension from OECD values
- Update the legend title (e.g., "OECD Better Life Index: Health")
- Update URL hash (`&dim=health`)
- If "Weighted Average" selected, show the weight sliders (task 0040)

## Acceptance Criteria

- [ ] Second dropdown appears only when OECD BLI is the active index
- [ ] 12 options listed (11 dimensions + Weighted Average)
- [ ] Default dimension is Life Satisfaction
- [ ] Dimension change updates map colors, legend, and URL hash instantly (no fetch needed — all dimensions are in the cached OECD value file)
- [ ] Dropdown hides when switching to HDI or WHR

## Implementation Notes

- All 11 OECD dimensions are in a single cached file (no fetch on dimension switch)
- The `getValue` accessor for OECD becomes: `(gdlCode, countryIso) => oecdValuesMap.get(gdlCode)?.[dimensionKey] ?? oecdCountryFallback.get(countryIso)?.[dimensionKey] ?? null`
- Position below the index dropdown with consistent styling

## Dependencies

- Blocked by: 0037 (index switcher)
- Blocks: 0040
